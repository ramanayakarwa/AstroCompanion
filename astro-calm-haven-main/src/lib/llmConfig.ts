export const LLM_CONFIG = {
  // Primary model (best balance)
  primary: {
    modelId: "Phi-3.2-mini-4k-instruct-q4f16_1-MLC",
    size: "~2.1GB",
    recommended: true,
    languages: ['en', 'hi'],
  },
  
  // Lightweight alternative
  lightweight: {
    modelId: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
    size: "~0.7GB",
    recommended: false,
    languages: ['en'],
  },
  
  // Hindi-optimized model
  hindi: {
    modelId: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    size: "~0.9GB",
    recommended: false,
    languages: ['en', 'hi'],
  },
  
  // Fallback for low memory
  tiny: {
    modelId: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
    size: "~1.8GB",
    recommended: false,
    languages: ['en'],
  }
};

export const getOptimalModel = (): string => {
  // Detect device capabilities
  if (typeof navigator !== 'undefined') {
    const hasWebGPU = 'gpu' in navigator;
    const memory = (navigator as any).deviceMemory || 4;
    
    if (hasWebGPU && memory >= 8) {
      return LLM_CONFIG.primary.modelId;
    } else if (memory >= 4) {
      return LLM_CONFIG.hindi.modelId;
    } else {
      return LLM_CONFIG.tiny.modelId;
    }
  }
  
  return LLM_CONFIG.primary.modelId;
};