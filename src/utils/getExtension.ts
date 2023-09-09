export function getExtension(url: string) {
  let index = url.lastIndexOf(".");
  if (index !== -1) {
    return url.slice(index + 1);
  }
}
