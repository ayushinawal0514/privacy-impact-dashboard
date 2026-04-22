import { ObjectId } from "mongodb";
import { getDB } from "../config/database";

type LogAccessArgs = {
  userId: string;
  organizationId: string;
  action: "read" | "write" | "update" | "delete" | "export";
  dataType?: string;
  datasetId?: string;
  datasetName?: string;
  recordId?: string;
  resourceId?: string;
  status?: "success" | "failure";
  loggedBy?: string;
  ipAddress?: string;
  userAgent?: string;
};

export async function logAccess(args: LogAccessArgs) {
  try {
    const db = getDB();

    const doc: any = {
      userId: args.userId,
      organizationId: args.organizationId,
      action: args.action,
      dataType: args.dataType || "health",
      recordId: args.recordId || null,
      resourceId: args.resourceId || args.recordId || null,
      datasetName: args.datasetName?.trim() || null,
      status: args.status || "success",
      loggedBy: args.loggedBy || args.userId,
      ipAddress: args.ipAddress || null,
      userAgent: args.userAgent || null,
      timestamp: new Date(),
    };

    if (args.datasetId && ObjectId.isValid(args.datasetId)) {
      doc.datasetId = new ObjectId(args.datasetId);
    }

    await db.collection("access_logs").insertOne(doc);
  } catch (error) {
    console.error("Failed to log access event:", error);
  }
}