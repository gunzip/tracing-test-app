import { HttpRequest, InvocationContext, HttpHandler } from "@azure/functions";
import {
  Attributes,
  SpanContext,
  SpanKind,
  SpanOptions,
  SpanStatusCode,
  TraceFlags,
  context,
  trace,
} from "@opentelemetry/api";
import { SEMATTRS_HTTP_STATUS_CODE } from "@opentelemetry/semantic-conventions";

// import {
//   getSpan,
//   setSpanContext,
// } from "@opentelemetry/api/build/src/trace/context-utils";
// import { SEMATTRS_HTTP_STATUS_CODE } from "@opentelemetry/semantic-conventions";

export default function createAppInsightsWrapper(func: HttpHandler) {
  return async (req: HttpRequest, invocationContext: InvocationContext) => {
    const startTime = Date.now();

    // Extract the trace context from the incoming request
    const traceParent = req.headers.get("traceparent");

    console.log("traceParent", traceParent);
    // console.log("headers", req.headers);

    const parts = traceParent?.split("-");

    const parentSpanContext =
      parts &&
      parts.length === 4 &&
      parts[1].length === 32 &&
      parts[2].length === 16
        ? {
            traceId: parts[1],
            spanId: parts[2],
            traceFlags: TraceFlags.NONE,
          }
        : null;

    const activeContext = context.active();

    const parentContext = parentSpanContext
      ? trace.setSpanContext(activeContext, parentSpanContext)
      : activeContext;

    const attributes: Attributes = {
      SEMATTRS_HTTP_METHOD: "HTTP",
      SEMATTRS_HTTP_URL: req.url,
    };

    const options: SpanOptions = {
      kind: SpanKind.SERVER,
      attributes: attributes,
      startTime: startTime,
    };

    const span: any = trace
      .getTracer("ApplicationInsightsTracer")
      .startSpan(`${req.method} ${req.url}`, options, parentContext);

    let res;
    try {
      res = await context.with(trace.setSpan(activeContext, span), async () => {
        return await func(req, invocationContext);
      });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: JSON.stringify(error),
      });
      throw error;
    } finally {
      const status = (res && res.status) || null;

      if (status) {
        span.setStatus({
          code: status < 400 ? SpanStatusCode.OK : SpanStatusCode.ERROR,
        });
        span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, status);
      }

      span.end(Date.now());
    }

    return res;
  };
}
