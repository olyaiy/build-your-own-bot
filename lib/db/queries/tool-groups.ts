import { and, eq } from 'drizzle-orm';
import { db } from '../queries';
import { toolGroups, toolGroupTools, tools } from '../schema';

export async function createToolGroup({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  const [newToolGroup] = await db
    .insert(toolGroups)
    .values({
      name,
      description,
    })
    .returning();

  return newToolGroup;
}

export async function getToolGroups() {
  return db.select().from(toolGroups);
}

export async function getToolGroupById(id: string) {
  const [toolGroup] = await db
    .select()
    .from(toolGroups)
    .where(eq(toolGroups.id, id));

  return toolGroup;
}

export async function updateToolGroup({
  id,
  name,
  description,
}: {
  id: string;
  name?: string;
  description?: string;
}) {
  const [updatedToolGroup] = await db
    .update(toolGroups)
    .set({
      name,
      description,
      updatedAt: new Date(),
    })
    .where(eq(toolGroups.id, id))
    .returning();

  return updatedToolGroup;
}

export async function deleteToolGroup(id: string) {
  await db.delete(toolGroups).where(eq(toolGroups.id, id));
}

export async function addToolToGroup({
  toolId,
  toolGroupId,
}: {
  toolId: string;
  toolGroupId: string;
}) {
  const [toolGroupTool] = await db
    .insert(toolGroupTools)
    .values({
      toolId,
      toolGroupId,
    })
    .returning();

  return toolGroupTool;
}

export async function removeToolFromGroup({
  toolId,
  toolGroupId,
}: {
  toolId: string;
  toolGroupId: string;
}) {
  await db
    .delete(toolGroupTools)
    .where(
      and(
        eq(toolGroupTools.toolId, toolId),
        eq(toolGroupTools.toolGroupId, toolGroupId)
      )
    );
}

export async function getToolsInGroup(toolGroupId: string) {
  return db
    .select({
      tool: tools,
    })
    .from(toolGroupTools)
    .innerJoin(tools, eq(toolGroupTools.toolId, tools.id))
    .where(eq(toolGroupTools.toolGroupId, toolGroupId));
}

export async function getGroupsForTool(toolId: string) {
  return db
    .select({
      toolGroup: toolGroups,
    })
    .from(toolGroupTools)
    .innerJoin(toolGroups, eq(toolGroupTools.toolGroupId, toolGroups.id))
    .where(eq(toolGroupTools.toolId, toolId));
} 