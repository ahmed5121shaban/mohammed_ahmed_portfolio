# infrastructure-data

Concrete implementations of the repository interfaces declared in
`domain` (e.g. a static-JSON or HTTP-backed profile/project repository).
May depend on `domain` and `shared-util`. Only the app composition root
imports this lib directly to provide it via DI.
