# Dependency-Cruiser Evaluation

## Quantitative results

- Tool category: static analysis
- Tool selected from outside the starter list: yes
- Modules analyzed: 1019
- Dependencies cruised: 4340
- Violations under the configured NodeBB rules: 0
- JSON artifact size: about 5.3 MB
- DOT graph artifact size: about 555 KB

## What was tested

1. Installed `dependency-cruiser` as a dev dependency in `install/package.json`.
2. Added a project-specific configuration in `.dependency-cruiser.mjs`.
3. Ran the tool against `app.js`, `loader.js`, `require-main.js`, `src/`, and `public/src/`.
4. Generated three reviewable artifacts:
   - CLI transcript in `analysis/dependency-cruiser/terminal-output.txt`
   - Machine-readable report in `analysis/dependency-cruiser/report.json`
   - Dependency graph in `analysis/dependency-cruiser/graph.dot`

## Interpretation

The selected rules found no violations. That is still useful evidence:

- The configured boundary checks did not detect any direct imports from server code into browser bundles or vice versa.
- No production code imported from `test/`.
- No circular dependencies were reported in the scanned module set under the current exclusions.

This suggests either that NodeBB already maintains these high-level architectural boundaries well, or that deeper rule tuning would be needed to surface finer-grained design concerns.

## Strengths observed

- Installation and execution were straightforward in a JavaScript codebase.
- The tool handled a large repository quickly enough to be practical for pull requests or CI.
- Custom rules are expressive and map well to architectural constraints, not just code style.
- Output formats are useful for different audiences: terminal for quick review, JSON for automation, DOT for visualization.

## Weaknesses observed

- Initial value depends heavily on good rule design; generic rules can either miss issues or produce noise.
- The raw JSON and graph outputs are large, so reviewers need summarized findings in the PR description.
- The tool does not provide semantic security or runtime behavior analysis; it is best paired with other techniques.
- A clean report can be ambiguous: it may indicate good architecture, or simply rules that are not yet strict enough.

## Suggested PR description draft

### Summary

This branch evaluates `dependency-cruiser` as a static analysis tool for NodeBB. It was chosen because it is not on the starter list, installs cleanly through npm, and supports custom architectural rules for JavaScript dependency graphs.

### Evidence of installation

- Added `dependency-cruiser` to `install/package.json`
- Captured `analysis/dependency-cruiser/npm-ls.txt` to verify the package is installed locally
- Generated `install/package-lock.json`, although this repository currently ignores `package-lock.json` files
- Added a new project-specific config file: `.dependency-cruiser.mjs`

### Evidence of execution

- `analysis/dependency-cruiser/terminal-output.txt`
- `analysis/dependency-cruiser/report.json`
- `analysis/dependency-cruiser/graph.dot`

### Findings

The configured scan analyzed 1019 modules and 4340 dependencies. It reported 0 violations for the following rules:

- no circular dependencies in `src/` and `public/src/`
- no server imports from browser bundle modules
- no browser imports from server core modules
- no production imports from `test/`

### Pros

- Good fit for large JavaScript repositories
- Strong support for architecture-oriented customization
- Easy to automate and attach to CI or PR workflows
- Produces multiple artifact formats

### Cons

- Requires deliberate rule tuning to provide high-value findings
- Large output artifacts need summarization for reviewers
- Does not replace security scanners, fuzzers, or runtime profiling tools

### Recommendation

Dependency-cruiser is a good candidate if the team wants lightweight static architecture checks in addition to existing linting and tests. Its strongest long-term use would be in CI with gradually tightened rules as architectural boundaries become more explicit.
