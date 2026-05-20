// 文案生成表单输入
export interface GenerateInput {
  copy_type: string;
  style: string;
  scenario: string;
  topic: string;
  extra_requirements?: string;
}

// 生成历史记录
export interface Generation {
  id: string;
  user_id: string;
  copy_type: string;
  style: string;
  scenario: string;
  topic: string;
  extra_requirements: string | null;
  result: string;
  created_at: string;
}

// 用户积分信息
export interface UserCredits {
  credits: number;
}

// API 响应
export interface GenerateResponse {
  success: boolean;
  result?: string;
  error?: string;
  credits_remaining?: number;
}

// 文案类型选项
export const COPY_TYPES = [
  { value: "产品文案", label: "产品文案" },
  { value: "广告语", label: "广告语" },
  { value: "公众号推文", label: "公众号推文" },
  { value: "短视频脚本", label: "短视频脚本" },
  { value: "小红书笔记", label: "小红书笔记" },
  { value: "朋友圈文案", label: "朋友圈文案" },
  { value: "品牌故事", label: "品牌故事" },
  { value: "活动策划", label: "活动策划" },
];

// 风格选项
export const STYLES = [
  { value: "专业正式", label: "专业正式" },
  { value: "幽默风趣", label: "幽默风趣" },
  { value: "温暖感人", label: "温暖感人" },
  { value: "简约清新", label: "简约清新" },
  { value: "激情澎湃", label: "激情澎湃" },
  { value: "文艺优雅", label: "文艺优雅" },
];

// 使用场景选项
export const SCENARIOS = [
  { value: "电商详情页", label: "电商详情页" },
  { value: "朋友圈", label: "朋友圈" },
  { value: "小红书", label: "小红书" },
  { value: "抖音", label: "抖音" },
  { value: "公众号", label: "公众号" },
  { value: "官网首页", label: "官网首页" },
  { value: "线下海报", label: "线下海报" },
];
