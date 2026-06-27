interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
  completed?: boolean
}

const steps = [
  { number: 1, label: 'Verificación' },
  { number: 2, label: 'Tus datos' },
  { number: 3, label: 'Confirmación' },
]

export default function StepIndicator({ currentStep, completed }: StepIndicatorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {steps.map((step, index) => {
          const isDone = completed ? true : step.number < currentStep
          const isActive = !completed && step.number === currentStep
          const isPending = !completed && step.number > currentStep

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
                    ${isDone ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-accent text-white ring-4 ring-blue-100' : ''}
                    ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                  `}
                >
                  {isDone ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`
                    text-xs mt-1 font-medium whitespace-nowrap
                    ${isDone ? 'text-green-600' : ''}
                    ${isActive ? 'text-accent' : ''}
                    ${isPending ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 mx-2 mb-5 transition-all
                    ${step.number < currentStep || completed ? 'bg-green-400' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
