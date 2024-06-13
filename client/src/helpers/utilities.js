import * as ethUtil from "ethereumjs-util";
import { providers } from "ethers";

export function encodePersonalMessage(msg) {
    const data = encoding.utf8ToBuffer(msg);
    const buf = Buffer.concat([
      Buffer.from(
        "\u0019Ethereum Signed Message:\n" + data.length.toString(),
        "utf8"
      ),
      data,
    ]);
    return ethUtil.bufferToHex(buf);
  }

export function hashPersonalMessage(msg) {
    const data = encodePersonalMessage(msg);
    const buf = ethUtil.toBuffer(data);
    const hash = ethUtil.keccak256(buf);
    return ethUtil.bufferToHex(hash);
}

export async function verifySignature(
  address,
  sig,
  hash,
  rpcUrl
){
  const provider = new providers.JsonRpcProvider(rpcUrl);
  const bytecode = await provider.getCode(address);
  if (
    !bytecode ||
    bytecode === "0x" ||
    bytecode === "0x0" ||
    bytecode === "0x00"
  ) {
    const signer = recoverAddress(sig, hash);
    return signer.toLowerCase() === address.toLowerCase();
  } else {
    return eip1271.isValidSignature(address, sig, hash, provider);
  }
}