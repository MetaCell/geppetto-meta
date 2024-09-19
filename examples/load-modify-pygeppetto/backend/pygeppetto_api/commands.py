from __future__ import annotations
from tkinter import E
from typing import Literal
from pydantic import BaseModel, Field, RootModel
import pyecore.commands as ec
from pyecore.resources import Resource
from pyecore.ecore import EObject


class JsonEObject(BaseModel):
    uuid: str


class JsonCommand(BaseModel): ...


class EObjectCommand(JsonCommand):
    owner: JsonEObject


class FeatureCommand(EObjectCommand):
    feature: str
    value: JsonEObject | int | str | float | bool | None = None


class Set(FeatureCommand):
    command_type: Literal["set"] = "set"


class Add(FeatureCommand):
    command_type: Literal["add"] = "add"
    index: int | None = None


class Remove(FeatureCommand):
    command_type: Literal["remove"] = "remove"
    index: int | None = None


class Move(FeatureCommand):
    command_type: Literal["move"] = "move"
    from_index: int | None = None
    to_index: int


class Delete(EObjectCommand):
    command_type: Literal["delete"] = "delete"


class Compound(JsonCommand):
    command_type: Literal["compound"] = "compound"
    commands: list[Compound | Delete | Move | Remove | Add | Set]


class AnyCommand(RootModel):
    root: Compound | Delete | Move | Remove | Add | Set = Field(
        discriminator="command_type"
    )


def deserialize(
    command: Compound | Delete | Move | Remove | Add | Set, context: Resource
):
    match command:
        case (Set() | Remove() | Move() | Add() | Delete()) as cmd:
            for eobject in context.contents[0].eAllContents():
                if eobject._internal_id == cmd.owner.uuid:
                    resolved = eobject
                    break
            else:
                resolved = None
            return getattr(ec, cmd.__class__.__name__)(
                owner=resolved,
                **cmd.model_dump(
                    exclude={"command_type", "owner"},
                    exclude_none=True,
                    exclude_unset=True,
                ),
            )
        case Compound() as compound:
            return ec.Compound([deserialize(x, context) for x in compound.commands])


class Registry:
    Add=Add
    Set=Set
    Remove=Remove
    Move=Move
    Delete=Delete
    Compound=Compound


def serialize(obj):
    match obj:
        case EObject() as o:
            return JsonEObject(uuid=o._internal_id)
        case (ec.Set() | ec.Add() | ec.Remove() | ec.Move() | ec.Add() | ec.Delete()) as cmd:
            cls = getattr(Registry, cmd.__class__.__name__)
            fields = [k for k in cls.model_fields.keys() if k not in ("command_type", "feature")]
            dct = {k: serialize(getattr(cmd, k)) for k in fields}
            dct["feature"] = cmd.feature.name
            return cls(**dct)
        case ec.Compound() as compound:
            return Compound(commands=[serialize(c) for c in compound])
    return obj