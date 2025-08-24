import {
  filterCandidates,
  rankCandidates,
  aggregateStats,
  loadCandidatesData,
} from "./data";
import type {
  MCPThinkResponse,
  MCPWorkflowState,
  TimelineStep,
} from "./types/types";

export class MCPWorkflow {
  private state: MCPWorkflowState;
  private onStepUpdate: (step: TimelineStep) => void;

  constructor(query: string, onStepUpdate: (step: TimelineStep) => void) {
    this.state = { query };
    this.onStepUpdate = onStepUpdate;
  }

  async execute(): Promise<MCPWorkflowState> {
    try {
      // Ensure data is loaded
      await loadCandidatesData();

      // Step 1: THINK - Get filter and ranking plans from LLM
      await this.think();

      // Step 2: ACT 1 - Filter candidates
      await this.filter();

      // Step 3: ACT 2 - Rank candidates
      await this.rank();

      // Step 4: SPEAK - Generate final response
      await this.speak();

      return this.state;
    } catch (error) {
      console.error("MCP Workflow error:", error);
      this.onStepUpdate({
        id: "error",
        type: "speaking",
        title: "Error occurred",
        timestamp: new Date(),
        status: "complete",
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
      throw error;
    }
  }

  private async think() {
    const step: TimelineStep = {
      id: "think",
      type: "thinking",
      title: "Analyzing query",
      timestamp: new Date(),
      status: "active",
    };
    this.onStepUpdate(step);

    try {
      const response = await fetch("/api/mcp/think", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: this.state.query }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Think API failed: ${response.status} ${errorText}`);
      }

      const thinkResponse: MCPThinkResponse = await response.json();
      this.state.thinkResponse = thinkResponse;

      this.onStepUpdate({
        ...step,
        status: "complete",
        data: thinkResponse,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      this.onStepUpdate({
        ...step,
        status: "complete",
        data: { error: "Failed to analyze query" },
      });
      throw error;
    }
  }

  private async filter() {
    const step: TimelineStep = {
      id: "filter",
      type: "filtering",
      title: "Filtering candidates",
      timestamp: new Date(),
      status: "active",
    };
    this.onStepUpdate(step);

    if (!this.state.thinkResponse) {
      throw new Error("No think response available");
    }

    try {
      const filteredCandidates = filterCandidates(
        this.state.thinkResponse.filter
      );
      this.state.filteredCandidates = filteredCandidates;

      this.onStepUpdate({
        ...step,
        status: "complete",
        data: {
          count: filteredCandidates.length,
          filter_plan: this.state.thinkResponse.filter,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      this.onStepUpdate({
        ...step,
        status: "complete",
        data: { error: "Failed to filter candidates" },
      });
      throw error;
    }
  }

  private async rank() {
    const step: TimelineStep = {
      id: "rank",
      type: "ranking",
      title: "Ranking candidates",
      timestamp: new Date(),
      status: "active",
    };
    this.onStepUpdate(step);

    if (!this.state.filteredCandidates || !this.state.thinkResponse) {
      throw new Error("No filtered candidates or think response available");
    }

    try {
      const candidateIds = this.state.filteredCandidates.map((c) => c.id);
      const rankedCandidates = rankCandidates(
        candidateIds,
        this.state.thinkResponse.rank
      );
      this.state.rankedCandidates = rankedCandidates;

      // Generate stats
      this.state.stats = aggregateStats(candidateIds);

      this.onStepUpdate({
        ...step,
        status: "complete",
        data: {
          ranked_ids: rankedCandidates.slice(0, 5).map((c) => c.id),
          ranking_plan: this.state.thinkResponse.rank,
          stats: this.state.stats,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      this.onStepUpdate({
        ...step,
        status: "complete",
        data: { error: "Failed to rank candidates" },
      });
      throw error;
    }
  }

  private async speak() {
    const step: TimelineStep = {
      id: "speak",
      type: "speaking",
      title: "Generating response",
      timestamp: new Date(),
      status: "active",
    };
    this.onStepUpdate(step);

    if (!this.state.rankedCandidates || !this.state.stats) {
      throw new Error("No ranked candidates or stats available");
    }

    try {
      const topCandidates = this.state.rankedCandidates.slice(0, 5);

      this.state.speakPayload = {
        query: this.state.query,
        candidates: topCandidates,
        stats: this.state.stats,
      };

      return this.state;

      const response = await fetch("/api/mcp/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: this.state.query,
          candidates: topCandidates,
          stats: this.state.stats,
        }),
      });

  

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Speak API failed: ${response.status} ${errorText}`);
      }

      const { message } = await response.json();
      this.state.finalResponse = message;

      this.onStepUpdate({
        ...step,
        status: "complete",
        data: { message },
      });
    } catch (error) {
      const fallbackMessage = `Found ${
        this.state.stats?.count || 0
      } candidates matching your query. ${
        this.state.rankedCandidates && this.state.rankedCandidates.length > 0
          ? `Top candidate: ${this.state.rankedCandidates[0].full_name} - ${this.state.rankedCandidates[0].title}`
          : "No candidates found."
      }`;

      this.state.finalResponse = fallbackMessage;

      this.onStepUpdate({
        ...step,
        status: "complete",
        data: {
          message: fallbackMessage,
          error: "API failed, using fallback response",
        },
      });
    }
  }
}
