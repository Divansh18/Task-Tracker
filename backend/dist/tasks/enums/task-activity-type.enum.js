"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskActivityType = void 0;
var TaskActivityType;
(function (TaskActivityType) {
    TaskActivityType["TaskCreated"] = "task_created";
    TaskActivityType["TaskUpdated"] = "task_updated";
    TaskActivityType["StatusChanged"] = "status_changed";
    TaskActivityType["PriorityChanged"] = "priority_changed";
    TaskActivityType["DueDateChanged"] = "due_date_changed";
    TaskActivityType["EstimateUpdated"] = "estimate_updated";
    TaskActivityType["EnergyLevelUpdated"] = "energy_level_updated";
    TaskActivityType["SubtaskAdded"] = "subtask_added";
    TaskActivityType["SubtaskUpdated"] = "subtask_updated";
    TaskActivityType["SubtaskCompleted"] = "subtask_completed";
    TaskActivityType["SubtaskReopened"] = "subtask_reopened";
    TaskActivityType["CommentAdded"] = "comment_added";
    TaskActivityType["FocusAssigned"] = "focus_assigned";
    TaskActivityType["FocusCleared"] = "focus_cleared";
    TaskActivityType["ReflectionSubmitted"] = "reflection_submitted";
})(TaskActivityType || (exports.TaskActivityType = TaskActivityType = {}));
//# sourceMappingURL=task-activity-type.enum.js.map