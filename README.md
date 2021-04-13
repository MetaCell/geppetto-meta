<p align="center">
  <img src="https://github.com/tarelli/bucket/blob/master/geppetto%20logo.png?raw=true" alt="Geppetto logo"/>
</p>

# Geppetto Meta

Geppetto MetaCell distribution

# Subtree management

**Subtree repositories:**

* geppetto.js
* jupyter-geppetto
* pygeppetto

The following sections are based on
the [devtut subtrees tutorial](https://devtut.github.io/git/subtrees.html#create-pull-and-backport-subtree).

### Pull from a subtree repository

```bash
git remote add js https://github.com/openworm/geppetto-client.git
git subtree pull --prefix geppetto.js js [BRANCH_NAME]
```

```bash
git remote add pygeppetto https://github.com/openworm/pygeppetto.git
git subtree pull --prefix pygeppetto pygeppetto [BRANCH_NAME]
```

```bash
git remote add jupyter https://github.com/openworm/org.geppetto.frontend.jupyter.git
git subtree pull --prefix jupyter-geppetto jupyter [BRANCH_NAME]
```

### Backport Subtree Updates

Create and checkout branch in remote of subtree. In the following example we'll call it `feature/123`:

```bash
git checkout -b feature/123 <remote>/development
```

Cherry-pick backports:

```bash
git cherry-pick -x --strategy=subtree <commitSha>
```

Push changes to remote:

```bash
git push <remote> feature/123
```

Create PR in the original repository.
