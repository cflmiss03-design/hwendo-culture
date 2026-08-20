
if (import.meta.env.PROD || process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}
