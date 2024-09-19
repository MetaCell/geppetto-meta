import { Add, AnyCommand, Compound, Delete, Move, Remove, Set } from "./rest";


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