"""
Greybox bootstrap for SW_VerticalSlice_01 — public plaza, company shell, atrium, cafe,
residential edge, Etta home volume, understudio access placeholder.
Run after creating/opening map at /Game/StudioWorld/Maps/SW_VerticalSlice_01
"""
import unreal

ZONES = [
    ("SW_PublicPlaza", unreal.Vector(0, 0, 50), unreal.Vector(4000, 4000, 100)),
    ("SW_CompanyProperty", unreal.Vector(5000, 0, 50), unreal.Vector(3000, 3000, 200)),
    ("SW_GrandAtrium", unreal.Vector(5000, 0, 250), unreal.Vector(1200, 1200, 400)),
    ("SW_Cafe", unreal.Vector(3500, 1500, 50), unreal.Vector(800, 600, 120)),
    ("SW_ResidentialEdge", unreal.Vector(-4000, 2000, 50), unreal.Vector(2000, 1500, 100)),
    ("SW_EttaHome", unreal.Vector(-4500, 2500, 50), unreal.Vector(600, 600, 300)),
    ("SW_UnderstudioAccess", unreal.Vector(0, -3500, -200), unreal.Vector(1000, 1000, 400)),
    ("SW_GroundZero_MassingPlaceholder", unreal.Vector(8000, 0, 800), unreal.Vector(600, 600, 1600)),
]


def _spawn_volume(label: str, center: unreal.Vector, extent: unreal.Vector) -> None:
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.StaticMeshActor, center, unreal.Rotator(0, 0, 0)
    )
    actor.set_actor_label(label)
    actor.set_actor_scale3d(
        unreal.Vector(extent.x / 100.0, extent.y / 100.0, extent.z / 100.0)
    )


def run():
    for label, center, extent in ZONES:
        _spawn_volume(label, center, extent)
    unreal.log("StudioWorld: vertical slice greybox volumes placed")


if __name__ == "__main__":
    run()
