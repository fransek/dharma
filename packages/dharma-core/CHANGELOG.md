# dharma-core

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
