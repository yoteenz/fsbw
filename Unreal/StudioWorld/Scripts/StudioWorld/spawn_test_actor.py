"""Spawn three greybox cubes + floor for Composer operator acceptance test. Run inside UE Editor."""
import unreal

FLOOR_Z = 0.0
CUBE_CLASS = unreal.StaticMeshActor


def _spawn_cube(label: str, location: unreal.Vector) -> unreal.Actor:
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        CUBE_CLASS, location, unreal.Rotator(0.0, 0.0, 0.0)
    )
    actor.set_actor_label(label)
    return actor


def run():
    _spawn_cube("SW_Operator_Floor_Proxy", unreal.Vector(0, 0, FLOOR_Z))
    _spawn_cube("SW_Operator_Block_A", unreal.Vector(200, 0, 100))
    _spawn_cube("SW_Operator_Block_B", unreal.Vector(0, 200, 100))
    _spawn_cube("SW_Operator_Block_C", unreal.Vector(-200, -100, 100))
    unreal.log("StudioWorld: spawn_test_actor complete")


if __name__ == "__main__":
    run()
