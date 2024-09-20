import { applyPatches, Patch, produceWithPatches } from "immer";
import { Add, AnyCommand, CommandsService, Compound, Delete, Move, Notification, Remove, Set } from "./rest";


type SetProps = Omit<Set, 'command_type'>
type AddProps = Omit<Add, 'command_type'>
type RemoveProps = Omit<Remove, 'command_type'>
type MoveProps = Omit<Move, 'command_type'>
type DeleteProps = Omit<Delete, 'command_type'>

export const set = (props: SetProps): Set => { return {
  ...props,
  command_type: 'set'
}}

export const add = (props: AddProps): Add => { return {
  ...props,
  command_type: 'add'
}}

export const remove = (props: RemoveProps): Remove => {return {
  ...props,
  command_type: 'remove'
}}

export const move = (props: MoveProps): Move => {return {
  ...props,
  command_type: 'move'
}}

export const delete_ = (props: DeleteProps): Delete => {return {
  ...props,
  command_type: 'delete'
}}

export const compound = (commands: Array<AnyCommand>): Compound => {return {
  commands,
  command_type: "compound"
}}

const resolve = (path: (string | number)[], model: Record<string, any>) => {
  let obj = model;
  for (const sub of path.slice(0, -1)) {
    obj = obj[sub]
  }
  return [obj.uuid, ...path.slice(-1)]
}

export const patch2commands = (patches: Patch[], model: any): (AnyCommand | null) => {
  const commands = []
  for (const p of patches) {
    if (p.op == "replace") {
      const [ownerUUID, feature] = resolve(p.path, model)
      const cmd: Set = set({ owner: {
        uuid: ownerUUID
      },
      feature: feature,
      value: p.value
      })
      commands.push(cmd)
    }
    // console.log("P", p)
  }
  if (commands.length === 0) {
    return null
  }
  return commands.length > 1 ? compound(commands) : commands[0]
}

export const notification2patches = (notifications: Notification[]): Patch[] => {
  const patches = []
  for (const notif of notifications) {
    const fragment = notif.notifier.path?.replace(/[/@]/g, '').split('.') || []
    if (notif.kind === 'set') {
      patches.push({
        op: 'replace',
        path: [...fragment, notif.feature],
        value: notif.new
      } as Patch)
    }
  }
  return patches
}

export const applyModification = async (model: any, custom: (draft: any) => void) => {
  const [_, _patches, _inversePatches] = produceWithPatches(model, custom)

  // Translate the command
  const command = patch2commands(_patches, model)
  if (!command) {
    return null
  }
  const notifications = await CommandsService.executeCommand("instances", command)

  // Translate the command back to a immer patch
  const patches = notification2patches(notifications)

  return applyPatches(model, patches)
}