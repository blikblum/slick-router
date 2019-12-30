export default function invariant (condition, format, ...args) {
  if (!condition) {
    let argIndex = 0
    throw new Error(
      'Invariant Violation: ' +
      format.replace(/%s/g, () => args[argIndex++])
    )
  }
}
