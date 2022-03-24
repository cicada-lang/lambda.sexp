import { Env } from "../env"
import { EqualCtx } from "../equal"
import { Exp } from "../exp"
import { Mod } from "../mod"
import { Stmt } from "../stmt"

export class AssertNotEqualStmt extends Stmt {
  constructor(public exps: Array<Exp>) {
    super()
  }

  async execute(mod: Mod): Promise<void> {
    for (let i = 0; i < this.exps.length - 1; i++) {
      this.assertEqual(mod, this.exps[i], this.exps[i + 1])
    }
  }

  private assertEqual(mod: Mod, left: Exp, right: Exp): void {
    const leftValue = left.evaluate(mod, new Env())
    const rightValue = right.evaluate(mod, new Env())
    if (leftValue.equal(EqualCtx.init(), rightValue)) {
      const output = `((fail assert-not-equal) ${left.format()} ${right.format()})`
      console.log(output)
      mod.output += output + "\n"
    }
  }
}
