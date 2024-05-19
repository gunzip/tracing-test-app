// import { registerInstrumentations } from "@opentelemetry/instrumentation";
// import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";

// // // NEEDED TO CALL SHIM METHODS
// import * as ai from "applicationinsights";

// process.env.APPLICATIONINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL = "NONE";
// process.env.APPLICATIONINSIGHTS_LOG_DESTINATION = "file+console";

// const aiConnectionString =
//   process.env["APPLICATIONINSIGHTS_CONNECTION_STRINGX"] ||
//   "<your connection string>";

// ai.useAzureMonitor({
//   azureMonitorExporterOptions: {
//     connectionString: aiConnectionString,
//   },
//   instrumentationOptions: {
//     azureSdk: { enabled: true },
//     http: { enabled: true },
//     mongoDb: { enabled: true },
//     mySql: { enabled: true },
//     postgreSql: { enabled: true },
//     redis: { enabled: false },
//     redis4: { enabled: true },
//   },
//   samplingRatio: 1.0,
//   enableLiveMetrics: true,
//   enableStandardMetrics: true,
// });

// import { metrics, trace } from "@opentelemetry/api";

// // instrument native node fetch
// registerInstrumentations({
//   tracerProvider: trace.getTracerProvider(),
//   meterProvider: metrics.getMeterProvider(),
//   instrumentations: [new UndiciInstrumentation()],
// });

// // const resource = detectResourcesSync({ detectors: getResourceDetectors() });

// // const tracerProvider = new NodeTracerProvider({ resource });
// // tracerProvider.addSpanProcessor(
// //   new SimpleSpanProcessor(
// //     new AzureMonitorTraceExporter({ connectionString: aiConnectionString }),
// //   ),
// // );
// // tracerProvider.register();

// // const loggerProvider = new LoggerProvider({ resource });
// // loggerProvider.addLogRecordProcessor(
// //   new SimpleLogRecordProcessor(
// //     new AzureMonitorLogExporter({
// //       connectionString: aiConnectionString,
// //     }),
// //   ),
// // );

// // registerInstrumentations({
// //   tracerProvider,
// //   loggerProvider,
// //   instrumentations: [
// //     getNodeAutoInstrumentations(),
// //     new UndiciInstrumentation(),
// //   ],
// // });

// // NOTE: The below code will soon be a part of a new package `@opentelemetry/instrumentation-azure-functions`
// // See here for more info: https://github.com/Azure/azure-functions-nodejs-library/issues/245
// // app.setup({ capabilities: { WorkerOpenTelemetryEnabled: true } });

// // const logger = loggerProvider.getLogger("default");
// // app.hook.log((context) => {
// //   logger.emit({
// //     body: context.message,
// //     severityNumber: toOtelSeverityNumber(context.level),
// //     severityText: context.level,
// //   });
// // });

// // app.hook.preInvocation((context) => {
// //   context.functionHandler = otelContext.bind(
// //     propagation.extract(otelContext.active(), {
// //       traceparent: context.invocationContext.traceContext!.traceParent,
// //       tracestate: context.invocationContext.traceContext!.traceState,
// //     }),
// //     context.functionHandler,
// //   );
// // });

// // function toOtelSeverityNumber(level: LogLevel): SeverityNumber {
// //   switch (level) {
// //     case "information":
// //       return SeverityNumber.INFO;
// //     case "debug":
// //       return SeverityNumber.DEBUG;
// //     case "error":
// //       return SeverityNumber.ERROR;
// //     case "trace":
// //       return SeverityNumber.TRACE;
// //     case "warning":
// //       return SeverityNumber.WARN;
// //     case "critical":
// //       return SeverityNumber.FATAL;
// //     default:
// //       return SeverityNumber.UNSPECIFIED;
// //   }
// // }

// ai.setup(aiConnectionString)
//   // .setAutoDependencyCorrelation(true)
//   // .setInternalLogging(false, false)
//   // .setAutoCollectRequests(true)
//   // .setAutoCollectPerformance(true, true)
//   // .setAutoCollectExceptions(true)
//   // .setAutoCollectDependencies(true)
//   // .setAutoCollectConsole(true, false)
//   // .setAutoCollectPreAggregatedMetrics(true)
//   // .setSendLiveMetrics(false)
//   // .enableWebInstrumentation(false)
//   .start();

// // does this work?
// ai.defaultClient.setAutoPopulateAzureProperties();
