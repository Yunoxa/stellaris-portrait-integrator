export default function makeConditionExclusive(
  group, // Group with exclusive condition
  otherGroup, // Group to exclude condition from
  conditions, // Condition array containing exclusive conditions
  otherConditions // Condition array to prevent conditions in
) {
  conditions.forEach((condition) => {
    if (condition.exclusive) {
      if (
        otherGroup.name != group.name &&
        otherGroup.group_name === group.group_name
      ) {
        otherConditions.forEach((otherCondition) => {
          console.log(otherCondition, condition)
          if (otherCondition === condition) {
            return;
          };
        });
        otherConditions.push({
          trigger: `NOT = { ${condition.trigger} }`,
          exclusive: false
        });
      }
    }
  });
}
