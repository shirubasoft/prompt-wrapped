import base64
import importlib.util
import json
import tempfile
import unittest
import zlib
from pathlib import Path
from unittest.mock import patch


COLLECTOR_PATH = Path(__file__).parents[1] / "public" / "collector.py"
SPEC = importlib.util.spec_from_file_location("prompt_wrapped_collector", COLLECTOR_PATH)
collector = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(collector)


def report():
    scores = [
        {"key": f"score-{index}", "label": f"Score {index}", "score": 7 + index / 10, "confidence": "high", "reason": "Repeated direct evidence."}
        for index in range(6)
    ]
    return {
        "version": 1,
        "generatedAt": "2026-08-27T00:00:00Z",
        "harness": "Codex",
        "theme": "neon-orbit",
        "developer": {
            "displayName": "Dev",
            "archetype": "The Test Pilot",
            "title": "Keeper of the Green Build",
            "tagline": "Runs the path before claiming the destination.",
            "summary": "A compact summary tied to repeated direct evidence.",
        },
        "coverage": {
            "sources": [{"name": "Codex", "prompts": 42, "sessions": 8, "status": "analyzed"}],
            "totalPrompts": 42,
            "window": "January to August 2026",
            "limitations": [],
        },
        "scores": scores,
        "fingerprint": {
            "shipsLike": "A release with a boarding pass.",
            "debugsLike": "A log with a cross-examination.",
            "testsLike": "A boundary with a passport check.",
            "communicatesLike": "A short decision record.",
        },
        "strengths": ["One", "Two", "Three"],
        "friction": ["One", "Two", "Three"],
        "moments": [
            {"label": "Moment", "value": f"Value {index}", "detail": "Specific detail."}
            for index in range(3)
        ],
        "skills": [{
            "name": "prove-the-path",
            "description": "Prove changes through their real entry point.",
            "trigger": "Executable behavior changes.",
            "content": "---\nname: prove-the-path\ndescription: Prove executable behavior.\n---\n\n# Outcome\n\nRun the real path.",
        }],
        "share": {"closingLine": "Keep the receipts.", "accentWords": ["proof", "paths"]},
    }


class CollectorTests(unittest.TestCase):
    def test_supported_harnesses_match_the_public_picker(self):
        self.assertEqual(
            collector.HARNESSES,
            {"agy", "claude", "codex", "copilot", "opencode", "qwen"},
        )

    def test_prompt_constrains_phone_sized_display_copy(self):
        prompt = " ".join(collector.ANALYSIS_PROMPT.split())
        self.assertIn("Keep rating labels at 28 characters or fewer", prompt)
        self.assertIn("each fingerprint metaphor at 100 characters or fewer", prompt)

    def test_parses_structured_harness_wrapper(self):
        wrapped = json.dumps({"type": "result", "structured_output": report()})
        self.assertEqual(collector.parse_report(wrapped)["developer"]["displayName"], "Dev")

    def test_parses_qwen_structured_result_wrapper(self):
        wrapped = json.dumps([{"type": "result", "structured_result": report()}])
        self.assertEqual(collector.parse_report(wrapped)["developer"]["displayName"], "Dev")

    def test_agy_runner_uses_read_only_plan_mode(self):
        with patch.object(collector, "run_command", return_value="{}") as run_command:
            collector.run_harness("agy", "prompt")
        command = run_command.call_args.args[0]
        self.assertIn("--mode=plan", command)
        self.assertNotIn("--dangerously-skip-permissions", command)

    def test_qwen_runner_excludes_mutating_tools(self):
        with patch.object(collector, "run_command", return_value="{}") as run_command:
            collector.run_harness("qwen", "prompt")
        command = run_command.call_args.args[0]
        self.assertIn("plan", command)
        self.assertIn("shell,write,edit,agent", command)

    def test_copilot_runner_denies_writes_and_shell(self):
        with patch.object(collector, "run_command", return_value="{}") as run_command:
            collector.run_harness("copilot", "prompt")
        command = run_command.call_args.args[0]
        self.assertIn("--deny-tool=write", command)
        self.assertIn("--deny-tool=shell", command)

    def test_python_encoding_matches_zlib_contract(self):
        encoded = collector.encode_report(report())
        padded = encoded + "=" * (-len(encoded) % 4)
        decoded = json.loads(zlib.decompress(base64.urlsafe_b64decode(padded)))
        self.assertEqual(decoded, report())

    def test_writes_report_and_complete_skill(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            collector.write_outputs(report(), output)
            self.assertTrue((output / "prompt-wrapped.json").is_file())
            self.assertIn("name: prove-the-path", (output / "skills" / "prove-the-path" / "SKILL.md").read_text())

    def test_rejects_path_traversal_skill_name(self):
        invalid = report()
        invalid["skills"][0]["name"] = "../nope"
        with self.assertRaises(collector.CollectorError):
            collector.validate_report(invalid)


if __name__ == "__main__":
    unittest.main()
