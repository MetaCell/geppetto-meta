from pyecore.ecore import EObject
from pygeppetto.visitor import Switch


def apply_single(eobject: EObject, fn, condition=lambda eobject: True):
    for element in eobject.eAllContents():
        if condition(element):
            fn(element)


def apply(eobject: EObject, visitor: Switch):
    visitor.do_switch(eobject)
    for element in eobject.eAllContents():
        visitor.do_switch(element)