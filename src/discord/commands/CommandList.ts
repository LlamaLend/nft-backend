import { Command } from "../Command";
import { Hello } from "./Hello";
import { Help } from "./Help";
import { List } from "./List";
import { Register } from "./Register";
import { Remove } from "./Remove";

export const CommandList: Command[] = [Hello, Register, Help, Remove, List];