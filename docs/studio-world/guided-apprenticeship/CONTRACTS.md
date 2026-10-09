# Engineering contracts

The executable form is `src/studio-os-core/guided-apprenticeship/`. These rules are what the tests lock.

## Guide

One assistant, two expressions. `spatial_host` in a room. `workspace_presenter` over a software desk. The expression is `spotlight`, `compact_panel`, or `aside`. Appearance, voice, and likeness are empty on purpose.

Beats: arrival, orientation, demonstration, takeover, observation, interpretation, replay, confirmation, completion.

Takeover sets control to the expert and moves the guide aside. The guide does not accept demonstration events until then.

## Observation

Events: selected an item, opened a record, changed a value, reordered a step, changed a decision, requested approval, rejected an action, explained why.

A reorder without an `explained_why` event linked to it stays `needs_clarification`. Replay is blocked. The original baseline is not overwritten.

## Knowledge

Industry, company, and private stay separate. A legal step cannot be silently removed. A company preference does not erase the researched order.

Stored status uses the Studio Institute lifecycle: `draft`, `interpreted`, `needs_clarification`, `expert_reviewed`, `owner_visible`, `approved_for_training`. Worker use and live execution are separate flags and stay false.

## Journal

Workflow Journal is the written capture of the same process. A demonstration should be able to emit the same status and the same step pair: researched wording plus the expert’s words. Old interview sessions are not migrated by this contract.

## Workspace request

If one sequence spans more than one surface, the lesson may emit a founder-review request. `appliedToProduction` is false.

## Roles

Founder and manager may read a private note. Staff may read the approved company sequence only. A client is not given private notes. An AI teammate is not given company steps or tools from training completion.

## Practice

Every event is `simulated: true`. Live filing, payment, money movement, customer notice, production edits, account changes, external calls, and deploy are refused.
