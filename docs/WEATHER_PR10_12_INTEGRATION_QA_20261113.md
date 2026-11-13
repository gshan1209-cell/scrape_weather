# PR #10–12 integration QA (review-only, no deployment)

This integration branch is a *new cross-PR acceptance slice* for the existing adoption
Trello card https://trello.com/c/YKq41zbL; it is NOT a replacement for individual
source PR ownership and does not supersede the original source PRs automatically.

## Pinned source
- Main baseline: `781a02a75ce497efa0762c5233fdc9a8e7ba4ea1`
- Existing PR #10: `a50bf976c271f70e3023cf78195f0450b21b432b` — signed integer / comfort classification
- Existing PR #11: `112ab6add5c75086ecc4cd537e7f9cbc6299d24b` — invalid station coordinate isolation
- Existing PR #12: `f511834a63098b10a97e3e3d11d65251a35385af` — bounded success-only forecast cache
- Combined weather_service.py: exact #12 source with #11 station function and
  #10 element/int functions applied by unique method boundaries; no other
  weather_service behavior rewritten.
- Other combined file contents are copied from their exact original PR SHAs.

## Independent CI / Gate
- Run all backend pytest fixtures and syntax checks in clean Python 3.12.
- Run Web unit tests/lint/build from locked npm dependencies, mock-only config.
- No real CWA network, credential, Third-party Flow, real assets or data mutation.
- Compare any failure against baseline and exact source versions; FAIL is never
  reclassified as PASS.
- Reviewer must inspect source/asset/rights/lease and owner before merging.

## Deployment boundary
This repository's GitHub main is connected to an existing Vercel production
deployment (before review: `781a02a75ce497efa0762c5233fdc9a8e7ba4ea1`). Merging any branch into main may trigger
automatic production deployment. The current user instruction is PR-only and
**supersedes previous deployment authorization**. Therefore this integration
PR is intentionally DRAFT and **must not be merged to production-linked main**
until the team can verifiably prevent the automatic deployment without changing
user protection or production settings outside authorization.

A Vercel Preview READY result is not a backend pytest run, not live CWA, not
mobile-render QA, and not an authorization to promote anything.

Separate still-outstanding scope: 390px mobile QA and official CWA Live credentials,
backend and TLS; neither is a prerequisite for candidate source review.
