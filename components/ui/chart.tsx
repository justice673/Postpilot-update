"use client"

import * as React from "react"
import { ResponsiveContainer, Tooltip } from "recharts"

// ---- Chart Config Types ----
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<string, string>
  }
>

// ---- Context ----
type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

// ---- ChartContainer ----
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof import("recharts").ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={className}
        style={
          {
            position: "relative",
            ...Object.entries(config).reduce((acc, [key, value]) => {
              if (value.color) {
                acc[`--color-${key}` as string] = value.color
              }
              return acc
            }, {} as Record<string, string>),
          } as React.CSSProperties
        }
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={0}>
            {children}
          </ResponsiveContainer>
        ) : null}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

// ---- ChartStyle (injects CSS vars) ----
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.color || cfg.theme)

  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart="${id}"] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.color || "transparent"
    return `  --color-${key}: ${color};`
  })
  .join("\n")}
}
.dark [data-chart="${id}"] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.dark || itemConfig.color || "transparent"
    return `  --color-${key}: ${color};`
  })
  .join("\n")}
}
`,
      }}
    />
  )
}

// ---- ChartTooltip ----
const ChartTooltip = Tooltip

// ---- ChartTooltipContent ----
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
      active?: boolean
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload?: any[]
      label?: string
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
      labelClassName?: string
      labelFormatter?: (value: string, payload: Record<string, unknown>[]) => React.ReactNode
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelKey,
      nameKey,
      labelClassName: _labelClassName, // eslint-disable-line @typescript-eslint/no-unused-vars
      // Strip Recharts internal props that shouldn't reach the DOM
      // @ts-expect-error - Recharts passes these internally
      itemSorter: _a, itemStyle: _b, labelStyle: _c, reverseDirection: _d, useTranslate3d: _e, wrapperStyle: _f, activeIndex: _g, accessibilityLayer: _h, cursor: _i, allowEscapeViewBox: _j, animationDuration: _k, animationEasing: _l, axisId: _m, contentStyle: _n, filterNull: _o, includeHidden: _p, isAnimationActive: _q, offset: _r, position: _s, // eslint-disable-line @typescript-eslint/no-unused-vars
      ...props
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) return null

      const item = payload[0]
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className="font-medium">
            {labelFormatter(String(value), payload as Record<string, unknown>[])}
          </div>
        )
      }

      if (!value) return null

      return <div className="font-medium">{value}</div>
    }, [label, labelFormatter, payload, hideLabel, labelKey, config])

    if (!active || !payload?.length) return null

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={`grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl ${className || ""}`}
        {...props}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item: Record<string, unknown>, index: number) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = (item.fill as string) || (item.color as string) || (item.payload as Record<string, unknown>)?.fill as string || ""

            return (
              <div
                key={item.dataKey as string || index}
                className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
              >
                {itemConfig?.icon ? (
                  <itemConfig.icon />
                ) : (
                  !hideIndicator && (
                    <div
                      className={`shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg] ${
                        indicator === "dot"
                          ? "h-2.5 w-2.5 rounded-full"
                          : indicator === "line"
                          ? "w-1"
                          : indicator === "dashed"
                          ? "w-0 border-[1.5px] border-dashed bg-transparent"
                          : "w-1"
                      }`}
                      style={
                        {
                          "--color-bg": indicatorColor,
                          "--color-border": indicatorColor,
                        } as React.CSSProperties
                      }
                    />
                  )
                )}
                <div
                  className={`flex flex-1 justify-between leading-none ${
                    nestLabel ? "items-end" : "items-center"
                  }`}
                >
                  <div className="grid gap-1.5">
                    {nestLabel ? tooltipLabel : null}
                    <span className="text-muted-foreground">
                      {itemConfig?.label || (item.name as string)}
                    </span>
                  </div>
                  {item.value != null && (
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {typeof item.value === "number"
                        ? item.value.toLocaleString()
                        : String(item.value)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// ---- ChartLegend ----
const ChartLegend = ({ content, ...props }: Record<string, unknown> & { content?: React.ReactNode }) => {
  // This just renders the content - recharts Legend passes payload to children
  if (React.isValidElement(content)) {
    return React.cloneElement(content as React.ReactElement<Record<string, unknown>>, props)
  }
  return null
}

// ---- ChartLegendContent ----
const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: Array<{
      value: string
      type?: string
      id?: string
      color?: string
      dataKey?: string
    }>
    verticalAlign?: "top" | "bottom"
    nameKey?: string
    hideIcon?: boolean
  }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) return null

    return (
      <div
        ref={ref}
        className={`flex items-center justify-center gap-4 ${
          verticalAlign === "top" ? "pb-3" : "pt-3"
        } ${className || ""}`}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="text-xs text-muted-foreground">
                {itemConfig?.label || item.value}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

// ---- Helpers ----
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) return undefined
  const payloadObj = payload as Record<string, unknown>

  const payloadPayload =
    "payload" in payloadObj && typeof payloadObj.payload === "object" && payloadObj.payload !== null
      ? (payloadObj.payload as Record<string, unknown>)
      : undefined

  let configLabelKey: string = key

  if (key in config) {
    configLabelKey = key
  } else if (payloadPayload) {
    const dataKey = payloadObj.dataKey as string
    if (dataKey && dataKey in config) {
      configLabelKey = dataKey
    }
  }

  return configLabelKey in config ? config[configLabelKey] : config[key]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChart,
}
