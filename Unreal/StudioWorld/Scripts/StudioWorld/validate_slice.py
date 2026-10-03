"""Basic validation: required greybox labels exist in current level."""
import unreal

REQUIRED_LABELS = [
    "SW_PublicPlaza",
    "SW_CompanyProperty",
    "SW_GrandAtrium",
    "SW_Cafe",
    "SW_ResidentialEdge",
    "SW_EttaHome",
    "SW_UnderstudioAccess",
]


def run() -> bool:
    actors = unreal.EditorLevelLibrary.get_all_level_actors()
    labels = {a.get_actor_label() for a in actors}
    missing = [l for l in REQUIRED_LABELS if l not in labels]
    if missing:
        unreal.log_error(f"StudioWorld validate_slice MISSING: {missing}")
        return False
    unreal.log("StudioWorld validate_slice PASS")
    return True


if __name__ == "__main__":
    run()
