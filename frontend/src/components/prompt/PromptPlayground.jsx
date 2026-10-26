import { useState } from 'react'

export default function PromptPlayground() {
  const [prompt, setPrompt] = useState(
    'Analyze this dataset and identify important trends.'
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Prompt Playground
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Create and test prompts for your data analysis tasks.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <label
          htmlFor="analysis-prompt"
          className="mb-3 block font-semibold text-gray-800 dark:text-gray-100"
        >
          Your analysis prompt
        </label>

        <textarea
          id="analysis-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={6}
          placeholder="Write your analysis instructions here..."
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />

        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Characters: {prompt.length}
        </p>

        <button
          type="button"
          onClick={() => setPrompt('')}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Clear prompt
        </button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        This playground currently edits prompts locally. Connecting it to the
        AI analysis backend is a separate step.
      </div>
    </div>
  )
}
