import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Brain, Sparkles } from 'lucide-react';
import type { ShapExplanation } from '../../types';
import GlassCard from '../UI/GlassCard';

interface Props {
  explanations: ShapExplanation[];
}

export default function ExplainableAI({ explanations }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <GlassCard className="col-span-6" delay={0.45}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Brain size={22} style={{ color: '#BF40BF', filter: 'drop-shadow(0 0 6px rgba(191,64,191,0.5))' }} />
        <h2 className="section-header" style={{ color: '#E6F1FF' }}>
          Explainable AI — SHAP Analysis
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {explanations.map((exp, i) => {
          const isExpanded = expandedId === exp.tweetId;
          const maxImpact = Math.max(...exp.features.map(f => Math.abs(f.impact)), 0.01);
          const predColor = exp.prediction === 'positive' ? '#39FF14' :
                           exp.prediction === 'negative' ? '#FF4444' : '#8892B0';

          return (
            <motion.div
              key={exp.tweetId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              style={{
                borderRadius: 12,
                background: 'rgba(17, 34, 64, 0.5)',
                border: `1px solid ${isExpanded ? predColor + '40' : 'rgba(255,255,255,0.05)'}`,
                overflow: 'hidden',
                transition: 'border-color 0.3s',
              }}
            >
              {/* Header */}
              <motion.div
                onClick={() => setExpandedId(isExpanded ? null : exp.tweetId)}
                whileHover={{ background: 'rgba(17, 34, 64, 0.8)' }}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#CCD6F6',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: isExpanded ? 'normal' : 'nowrap',
                  }}>
                    "{exp.tweetText}"
                  </p>
                </div>

                {/* Prediction badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: `${predColor}20`,
                    color: predColor,
                    fontSize: '0.65rem',
                    fontFamily: "'Orbitron', monospace",
                    fontWeight: 700,
                    border: `1px solid ${predColor}30`,
                    textTransform: 'uppercase',
                  }}>
                    {exp.prediction}
                  </span>
                  <span style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#FFD700',
                  }}>
                    {(exp.confidence * 100).toFixed(0)}%
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} color="#8892B0" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '0 16px 16px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 12,
                        marginBottom: 14,
                      }}>
                        <Sparkles size={14} color="#FFD700" />
                        <span style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#FFD700',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}>
                          Feature Impact (SHAP Values)
                        </span>
                      </div>

                      {exp.features.map((feature, j) => {
                        const barWidth = (Math.abs(feature.impact) / maxImpact) * 100;
                        const barColor = feature.direction === 'positive' ? '#39FF14' : '#FF4444';

                        return (
                          <motion.div
                            key={feature.word}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.05 }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              marginBottom: 8,
                            }}
                          >
                            <span style={{
                              width: 70,
                              fontFamily: "'Rajdhani', sans-serif",
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#E6F1FF',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {feature.word}
                            </span>

                            <div style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              position: 'relative',
                            }}>
                              {/* Center line */}
                              <div style={{
                                position: 'absolute',
                                left: '50%',
                                top: 0,
                                bottom: 0,
                                width: 1,
                                background: 'rgba(255,255,255,0.1)',
                              }} />

                              {/* Bar */}
                              <div style={{
                                width: '100%',
                                height: 14,
                                display: 'flex',
                                justifyContent: feature.direction === 'positive' ? 'flex-start' : 'flex-end',
                                paddingLeft: feature.direction === 'positive' ? '50%' : 0,
                                paddingRight: feature.direction === 'negative' ? '50%' : 0,
                              }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${barWidth / 2}%` }}
                                  transition={{ duration: 0.8, delay: j * 0.1 }}
                                  style={{
                                    height: '100%',
                                    background: `linear-gradient(${feature.direction === 'positive' ? '90deg' : '270deg'}, ${barColor}60, ${barColor})`,
                                    borderRadius: feature.direction === 'positive' ? '0 4px 4px 0' : '4px 0 0 4px',
                                    boxShadow: `0 0 6px ${barColor}40`,
                                  }}
                                />
                              </div>
                            </div>

                            <span style={{
                              width: 45,
                              fontFamily: "'Orbitron', monospace",
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              color: barColor,
                              textAlign: 'left',
                            }}>
                              {feature.impact > 0 ? '+' : ''}{feature.impact.toFixed(3)}
                            </span>
                          </motion.div>
                        );
                      })}

                      {/* Explanation text */}
                      <div style={{
                        marginTop: 12,
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: 'rgba(0, 212, 255, 0.05)',
                        border: '1px solid rgba(0, 212, 255, 0.1)',
                      }}>
                        <p style={{
                          fontSize: '0.7rem',
                          color: '#8892B0',
                          lineHeight: 1.5,
                        }}>
                          💡 This tweet was classified as <strong style={{ color: predColor }}>{exp.prediction}</strong> with {(exp.confidence * 100).toFixed(0)}% confidence.
                          The most influential words were{' '}
                          <strong style={{ color: '#E6F1FF' }}>
                            {exp.features.slice(0, 3).map(f => `"${f.word}"`).join(', ')}
                          </strong>.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
