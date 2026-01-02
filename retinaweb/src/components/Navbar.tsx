import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Sample data for the models
const data = [
  { name: "ResNet50", f1: 0.82, prec: 0.85, rec: 0.8 },
  { name: "DenseNet121", f1: 0.88, prec: 0.87, rec: 0.89 },
  { name: "ConvNeXt", f1: 0.89, prec: 0.88, rec: 0.9 },
  { name: "Swin Tiny", f1: 0.91, prec: 0.9, rec: 0.92 },
  { name: "EfficientNet-B3", f1: 0.93, prec: 0.92, rec: 0.94 },
];

const modelCards = [
  {
    name: "ResNet50",
    role: "The Classic Backbone",
    spec: "Input: 224x224px | 50 Layers",
    desc: "Provides robust baseline features and proven reliability for medical imaging tasks.",
  },
  {
    name: "DenseNet121",
    role: "The Connector",
    spec: "Input: 224x224px | Dense Blocks",
    desc: "Excels at feature reuse and gradient flow, capturing subtle retinal patterns.",
  },
  {
    name: "ConvNeXt",
    role: "Modern CNN",
    spec: "Input: 224x224px | LayerNorm",
    desc: "Brings next-gen convolutional design for improved accuracy and efficiency.",
  },
  {
    name: "Swin Tiny",
    role: "The Vision Transformer",
    spec: "Input: 224x224px | Shifted Windows",
    desc: "Captures global context and fine structure using transformer-based attention.",
  },
  {
    name: "EfficientNet-B3",
    role: "The High-Res Expert",
    spec: "Input: 300x300px | Compound Scaling",
    desc: "Optimized for fine-grained detail and efficiency with advanced scaling.",
  },
];

const COLORS = {
  f1: "#06b6d4", // Teal
  prec: "#6366f1", // Indigo
  rec: "#a21caf", // Purple
};

const ModelAnalytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-blue-50 text-slate-800 py-10 px-4">
      {/* Section A: Header */}
      <section className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">
          Heterogeneous Ensemble Strategy
        </h1>
        <p className="text-lg text-slate-600">
          Instead of relying on a single model, RetinaWeb leverages a team of 5
          specialized deep learning architectures. Each brings unique strengths,
          ensuring robust and reliable retinal disease detection.
        </p>
      </section>

      {/* Section B: Performance Chart */}
      <section className="max-w-5xl mx-auto mb-14 bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-slate-100">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">
          Model Performance Comparison
        </h2>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
            <XAxis dataKey="name" tick={{ fontSize: 14, fill: "#334155" }} />
            <YAxis
              domain={[0.75, 1]}
              tick={{ fontSize: 13, fill: "#64748b" }}
            />
            <Tooltip
              contentStyle={{
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e0e7ef",
              }}
              formatter={(value: number) => value.toFixed(2)}
            />
            <Legend wrapperStyle={{ fontSize: 14 }} />
            <Bar
              dataKey="f1"
              name="F1-Score"
              fill={COLORS.f1}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="prec"
              name="Precision"
              fill={COLORS.prec}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="rec"
              name="Recall"
              fill={COLORS.rec}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-xs text-slate-500 mt-3 text-right">
          * Metrics are averaged across validation folds.
        </div>
      </section>

      {/* Section C: Specialist Team Cards */}
      <section className="max-w-6xl mx-auto mb-14">
        <h2 className="text-xl font-semibold mb-6 text-blue-800 text-center">
          Meet the Specialist Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modelCards.map((model) => (
            <div
              key={model.name}
              className="bg-white border border-slate-100 rounded-2xl shadow-md p-6 flex flex-col items-start transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-blue-900">
                  {model.name}
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {model.role}
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-2">{model.spec}</div>
              <div className="text-slate-700 text-sm">{model.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section D: Key Insights */}
      <section className="max-w-3xl mx-auto text-center mt-10">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Ensemble Vote: The Power of Collaboration
          </h3>
          <p className="text-slate-700">
            By combining predictions from all five models, our ensemble
            consistently outperforms any single architecture. This collaborative
            approach delivers higher accuracy, better generalization, and
            increased confidence in every diagnosis.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ModelAnalytics;
