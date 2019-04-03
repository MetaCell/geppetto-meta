from types import MethodType as instancemethod

import sys


if sys.version_info[0] < 3:
    # Make the environment more like Python 3.0
    __metaclass__ = type
    from itertools import izip as zip


class overloaded:
    """An implementation of overloaded functions."""

    def __init__(self, default_func:int):
        # Decorator to declare new overloaded function.
        self.registry = {}
        self.cache = {}
        self.default_func = default_func

    def __get__(self, obj, type=None):
        if obj is None:
            return self
        return instancemethod(self, obj)

    def register(self, *types):
        """Decorator to register an implementation for a specific set of types.

        .register(t1, t2)(f) is equivalent to .register_func((t1, t2), f).

        """

        def helper(func):
            self.register_func(types, func)
            return func

        return helper

    def register_func(self, types, func):
        """Helper to register an implementation."""
        self.registry[tuple(types)] = func
        self.cache = {}  # Clear the cache (later we can optimize this).

    def __call__(self, *args):
        """Call the overloaded function."""
        types = tuple(map(type, args))
        func = self.cache.get(types)
        if func is None:
            self.cache[types] = func = self.find_func(types)
        return func(*args)

    def find_func(self, types):
        """Find the appropriate overloaded function; don't call it.

        This won't work for old-style classes or classes without __mro__.

        """
        func = self.registry.get(types)
        if func is not None:
            # Easy case -- direct hit in registry.
            return func

        # XXX Phillip Eby suggests to use issubclass() instead of __mro__.
        # There are advantages and disadvantages.

        # I can't help myself -- this is going to be intense functional code.
        # Find all possible candidate signatures.
        mros = tuple(t.__mro__ for t in types)
        n = len(mros)
        candidates = [sig for sig in self.registry
                      if len(sig) == n and
                      all(t in mro for t, mro in zip(sig, mros))]
        if not candidates:
            # No match at all -- use the default function.
            return self.default_func
        if len(candidates) == 1:
            # Unique match -- that's an easy case.
            return self.registry[candidates[0]]

        # More than one match -- weed out the subordinate ones.

        def dominates(dom, sub,
                      orders=tuple(dict((t, i) for i, t in enumerate(mro))
                                   for mro in mros)):
            # Predicate to decide whether dom strictly dominates sub.
            # Strict domination is defined as domination without equality.
            # The arguments dom and sub are type tuples of equal length.
            # The orders argument is a precomputed auxiliary data structure
            # giving dicts of ordering information corresponding to the
            # positions in the type tuples.
            # A type d dominates a type s iff order[d] <= order[s].
            # A type tuple (d1, d2, ...) dominates a type tuple of equal length
            # (s1, s2, ...) iff d1 dominates s1, d2 dominates s2, etc.
            if dom is sub:
                return False
            return all(order[d] <= order[s]
                       for d, s, order in zip(dom, sub, orders))

        # I suppose I could inline dominates() but it wouldn't get any clearer.
        candidates = [cand
                      for cand in candidates
                      if not any(dominates(dom, cand) for dom in candidates)]
        if len(candidates) == 1:
            # There's exactly one candidate left.
            return self.registry[candidates[0]]

        # Perhaps these multiple candidates all have the same implementation?
        funcs = set(self.registry[cand] for cand in candidates)
        if len(funcs) == 1:
            return funcs.pop()

        # No, the situation is irreducibly ambiguous.
        raise TypeError("ambigous call; types=%r; candidates=%r" %
                        (types, candidates))


class overloadedclassmethod(overloaded):
    def __init__(self, default_func):
        super(overloadedclassmethod, self).__init__(default_func)
        self.default_func = classmethod(self.default_func)

    def register(self, *types):
        """Decorator to register an implementation for a specific set of types.

        .register(t1, t2)(f) is equivalent to .register_func((t1, t2), f).

        """

        def helper(func):
            func = classmethod(func)
            self.register_func(types, func)
            return func

        return helper
