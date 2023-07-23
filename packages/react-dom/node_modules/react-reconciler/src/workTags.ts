/** fiberNode可以支持的类型 */
export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

/** 函数组件 */
export const FunctionComponent = 0;
/** 项目挂载的根节点 */
export const HostRoot = 3;
/**  原生的 HTML 标签 */
export const HostComponent = 5;
/** 文本节点 */
export const HostText = 6;
