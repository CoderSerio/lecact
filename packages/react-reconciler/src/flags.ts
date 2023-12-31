export type Flags = number;

export const NoFlags = 0b00000001;
export const Placement = 0b00000010;
export const Update = 0b00000100;
export const ChildDeletion = 0b00001000;

/**
 * commit的三个子阶段中，处理 mutation
 * 利用下面这个 mutation 掩码，只需要将 subtreeFlags 与之按位与运算一下，
 * 就能知道是否存在这些副作用了
 *
 */
export const MutationMask = Placement | Update | ChildDeletion;
