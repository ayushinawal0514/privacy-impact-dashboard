import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserById, logSystemEvent } from "@/lib/db-operations";
import { ObjectId } from "mongodb";

export type UserRole = "admin" | "compliance_officer" | "data_owner" | "auditor" | "viewer";

// RBAC Permission Definitions
const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    "read:all",
    "write:all",
    "delete:all",
    "manage:users",
    "manage:systems",
    "generate:reports",
    "configure:alerts",
  ],
  compliance_officer: [
    "read:systems",
    "read:risks",
    "read:compliance",
    "write:compliance",
    "generate:reports",
    "manage:alerts",
  ],
  auditor: [
    "read:systems",
    "read:risks",
    "read:logs",
    "read:audit_reports",
    "generate:reports",
  ],
  data_owner: [
    "read:systems",
    "write:data_flows",
    "read:risks",
    "manage:data_flows",
  ],
  viewer: [
    "read:systems",
    "read:risks",
    "read:compliance",
  ],
};

// API Endpoint Access Control
const endpointAccessControl: Record<string, UserRole[]> = {
  "GET /api/risks": ["admin", "compliance_officer", "auditor"],
  "POST /api/risks": ["admin", "compliance_officer"],
  "GET /api/access-logs": ["admin", "auditor"],
  "POST /api/access-logs": ["admin"],
  "GET /api/compliance": ["admin", "compliance_officer"],
  "POST /api/compliance": ["admin", "compliance_officer"],
  "GET /api/audit-reports": ["admin", "auditor"],
  "POST /api/audit-reports": ["admin", "auditor"],
  "GET /api/alerts": ["admin", "compliance_officer"],
  "POST /api/alerts": ["admin", "compliance_officer"],
  "GET /api/dashboard/metrics": ["admin", "compliance_officer", "viewer"],
};

/**
 * Authorization middleware to check user permissions
 */
export async function requireAuth(
  req: NextRequest,
  requiredRoles?: UserRole[],
): Promise<{ session: any; authorized: boolean } | { error: string; status: number }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { error: "Unauthorized", status: 401 };
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = (session.user as any)?.role as UserRole;
      if (!requiredRoles.includes(userRole)) {
        await logSystemEvent("warn", "auth", "Unauthorized access attempt", {
          userId: session.user?.email,
          requiredRoles,
          userRole,
        });
        return { error: "Forbidden", status: 403 };
      }
    }

    return { session, authorized: true };
  } catch (error) {
    return { error: "Internal server error", status: 500 };
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role] || [];
  return (
    permissions.includes(permission) ||
    permissions.includes("read:all") ||
    permissions.includes("write:all") ||
    permissions.includes("delete:all")
  );
}

/**
 * Logging middleware factory
 */
export function createLoggingMiddleware() {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const session = await getServerSession(authOptions);

    // Log the request
    const duration = Date.now() - startTime;

    await logSystemEvent("info", "api", `${req.method} ${req.nextUrl.pathname}`, {
      method: req.method,
      path: req.nextUrl.pathname,
      userId: session?.user?.email,
      userRole: (session?.user as any)?.role,
      duration,
      status: 200, // Would be set by response interceptor in real implementation
    });
  };
}

/**
 * Audit logging for sensitive operations
 */
export async function auditLog(
  action: string,
  resourceType: string,
  resourceId: string,
  changes: Record<string, any>,
  session: any,
) {
  await logSystemEvent("info", "audit", `${action} on ${resourceType}`, {
    action,
    resourceType,
    resourceId,
    changes,
    userId: session?.user?.email,
    userRole: (session?.user as any)?.role,
    timestamp: new Date(),
  });
}

/**
 * Validate RBAC for endpoint
 */
export async function validateEndpointAccess(
  method: string,
  pathname: string,
  session: any,
): Promise<boolean> {
  const endpoint = `${method} ${pathname}`;
  const allowedRoles = endpointAccessControl[endpoint];

  if (!allowedRoles) {
    // If endpoint not in ACL, allow for now
    return true;
  }

  const userRole = (session?.user as any)?.role as UserRole;
  return allowedRoles.includes(userRole);
}

/**
 * Rate limiting key generator
 */
export function getRateLimitKey(session: any, endpoint: string): string {
  const userId = session?.user?.id || "anonymous";
  const timestamp = Math.floor(Date.now() / (60 * 1000)); // Per minute
  return `ratelimit:${userId}:${endpoint}:${timestamp}`;
}

/**
 * Generate audit report
 */
export async function generateAuditTrail(
  startDate: Date,
  endDate: Date,
  userId?: string,
  action?: string,
) {
  const query: any = {
    timestamp: { $gte: startDate, $lte: endDate },
  };

  if (userId) query.userId = new ObjectId(userId);
  if (action) query.actionType = action;

  // This would query the audit logs collection
  // return db.collection("audit_trails").find(query).toArray();
  
  return [];
}
