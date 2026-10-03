"""Capture high-res screenshot to artifacts folder (founder machine). Requires Automation Library."""
import os
import unreal

ARTIFACT_SUBDIR = "artifacts/ue-composer-operator-migration-bootstrap1/screenshots"


def run(filename: str = "ue_capture.png"):
    repo_root = unreal.Paths.project_dir()
    out_dir = os.path.join(repo_root, "..", "..", ARTIFACT_SUBDIR)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, filename)
    unreal.AutomationLibrary.take_high_res_screenshot(1920, 1080, out_path)
    unreal.log(f"StudioWorld: screenshot -> {out_path}")


if __name__ == "__main__":
    run()
