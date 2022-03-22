import { join } from "path";

export function binPath(name: string) {
  const RUST_BIN_FOLDER = ["target", "wasm32-unknown-unknown", "release"];
  return join(__dirname, "..", ...RUST_BIN_FOLDER, `${name}.wasm`);
}
