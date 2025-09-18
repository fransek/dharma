# dharma-core

## 0.9.0

### Minor Changes

- [#79](https://github.com/fransek/dharma/pull/79) [`c9d0a43`](https://github.com/fransek/dharma/commit/c9d0a4301dcad416fbe8080c1209b919a917af73) Thanks [@fransek](https://github.com/fransek)! - support for atomic states (non-object states)

- [#81](https://github.com/fransek/dharma/pull/81) [`d57ef7e`](https://github.com/fransek/dharma/commit/d57ef7e90983ec515927e032e4a7ede07bc7bff7) Thanks [@fransek](https://github.com/fransek)! - derive: a new utility that creates a derived store from another

### Patch Changes

- [#85](https://github.com/fransek/dharma/pull/85) [`d524cd3`](https://github.com/fransek/dharma/commit/d524cd38b4ce4a5fc009b60826e543a4ff7a4ebc) Thanks [@fransek](https://github.com/fransek)! - replaced most jsdoc content with links to the external documentation.

- [#84](https://github.com/fransek/dharma/pull/84) [`b93dd82`](https://github.com/fransek/dharma/commit/b93dd8233fb91df6494552d60c45955f2247585a) Thanks [@fransek](https://github.com/fransek)! - store actions now default to undefined instead of empty object

## 0.8.0

### Minor Changes

- [#62](https://github.com/fransek/dharma/pull/62) [`a1e8b17`](https://github.com/fransek/dharma/commit/a1e8b1774716e9a581a0f65f2695479c5ed4df76) Thanks [@fransek](https://github.com/fransek)! - stores no longer expose set and reset methods

## 0.7.1

### Patch Changes

- [#59](https://github.com/fransek/dharma/pull/59) [`c41cc6b`](https://github.com/fransek/dharma/commit/c41cc6b23e713b8ede38e7a8d6db209431d6ed23) Thanks [@fransek](https://github.com/fransek)! - jsdoc updates

- [#48](https://github.com/fransek/dharma/pull/48) [`f176a98`](https://github.com/fransek/dharma/commit/f176a98a041b1496b4818515cf7214d3fc32b431) Thanks [@fransek](https://github.com/fransek)! - Renamed StoreEventHandler to StoreEventListener

## 0.7.0

### Minor Changes

- [#40](https://github.com/fransek/dharma/pull/40) [`df3f121`](https://github.com/fransek/dharma/commit/df3f121c839dcfb4236be3e6c61de368f9bee03b) Thanks [@fransek](https://github.com/fransek)! - createStore now supports async storage

### Patch Changes

- [#36](https://github.com/fransek/dharma/pull/36) [`375f232`](https://github.com/fransek/dharma/commit/375f2329793b7993b5ac960fbc4583c798e0f060) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Update JSDoc examples to use current createStore API

## 0.6.1

### Patch Changes

- [#26](https://github.com/fransek/dharma/pull/26) [`8a0b22e`](https://github.com/fransek/dharma/commit/8a0b22e3464841bf66b405df9aaf05acdf381673) Thanks [@fransek](https://github.com/fransek)! - Refactored createStore for better readability

## 0.6.0

### Minor Changes

- [#24](https://github.com/fransek/dharma/pull/24) [`e906944`](https://github.com/fransek/dharma/commit/e90694435d35b2805b564af2318f3d43e454c88e) Thanks [@fransek](https://github.com/fransek)! - Removed createPersistentStore and extended createStore to handle persistent state

## 0.5.0

### Minor Changes

- [#11](https://github.com/fransek/dharma/pull/11) [`02d9045`](https://github.com/fransek/dharma/commit/02d90457696dc1c2921c4e1d2e74b33234f96baf) Thanks [@fransek](https://github.com/fransek)! - createPersistentStorage: The storage option now only supports storage objects (previously "local" and "session")

### Patch Changes

- [#11](https://github.com/fransek/dharma/pull/11) [`02d9045`](https://github.com/fransek/dharma/commit/02d90457696dc1c2921c4e1d2e74b33234f96baf) Thanks [@fransek](https://github.com/fransek)! - createPersistentStorage now works in non-browser environments if a storage is provided

- [#11](https://github.com/fransek/dharma/pull/11) [`02d9045`](https://github.com/fransek/dharma/commit/02d90457696dc1c2921c4e1d2e74b33234f96baf) Thanks [@fransek](https://github.com/fransek)! - jsdoc updates

## 0.4.0

### Minor Changes

- [#8](https://github.com/fransek/dharma/pull/8) [`2060d71`](https://github.com/fransek/dharma/commit/2060d71fbbecba7d37f658f03fdfd9d1f49bc275) Thanks [@fransek](https://github.com/fransek)! - Event handler and defineActions arguments consolidated to an object

- [#8](https://github.com/fransek/dharma/pull/8) [`2060d71`](https://github.com/fransek/dharma/commit/2060d71fbbecba7d37f658f03fdfd9d1f49bc275) Thanks [@fransek](https://github.com/fransek)! - Consolidated createStore arguments to one configuration object

- [#8](https://github.com/fransek/dharma/pull/8) [`2060d71`](https://github.com/fransek/dharma/commit/2060d71fbbecba7d37f658f03fdfd9d1f49bc275) Thanks [@fransek](https://github.com/fransek)! - Added reset function to store event handlers

### Patch Changes

- [#8](https://github.com/fransek/dharma/pull/8) [`2060d71`](https://github.com/fransek/dharma/commit/2060d71fbbecba7d37f658f03fdfd9d1f49bc275) Thanks [@fransek](https://github.com/fransek)! - onAttach is now invoked before the first listener subscribes

## 0.3.0

### Minor Changes

- [#6](https://github.com/fransek/dharma/pull/6) [`4eaa8c1`](https://github.com/fransek/dharma/commit/4eaa8c15499e1d3d7d1001d6eb2da0157fbae56d) Thanks [@fransek](https://github.com/fransek)! - Listeners are now invoked upon subscribing

- [#6](https://github.com/fransek/dharma/pull/6) [`4eaa8c1`](https://github.com/fransek/dharma/commit/4eaa8c15499e1d3d7d1001d6eb2da0157fbae56d) Thanks [@fransek](https://github.com/fransek)! - Store listeners receive the current state through a function parameter

## 0.2.1

### Patch Changes

- [#4](https://github.com/fransek/dharma/pull/4) [`706c988`](https://github.com/fransek/dharma/commit/706c98838bbd033d20dbff6e41595ac5b0d69ad2) Thanks [@fransek](https://github.com/fransek)! - Updated some jsdoc comments

## 0.2.0

### Minor Changes

- [`8c5d2a3`](https://github.com/fransek/dharma/commit/8c5d2a3e25559c32536549eb7b04bceab07aa0cd) Thanks [@fransek](https://github.com/fransek)! - Simplified API and minor configuration tweaks
