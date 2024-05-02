export const restrictions = {};

export function createRestrictions(blockNames, newRestrictions) {
  blockNames.forEach((blockName) => {
    restrictions[blockName] = newRestrictions;
  });
}

export function executeRestrictions(workspace) {
  const blocks = workspace.getAllBlocks(false);

  blocks.forEach((block) => {
    if (!restrictions[block.type]) return;

    const errors = [];

    restrictions[block.type].forEach((restriction) => {
      switch (restriction.type) {
        case "hasParent":
          if (!hasParentOfType(block, restriction.blockTypes))
            errors.push(restriction.message);
          break;
        case "notEmpty":
          let empty = true;
          restriction.blockTypes.forEach((type) => {
            if (block.getInput(type)?.connection.targetBlock()) empty = false;
          });
          if (empty) errors.push(restriction.message);
          break;
        case "surroundParent":
          let passSP = false;
          restriction.blockTypes.forEach((type) => {
            if (block.getSurroundParent()?.type == type) passSP = true;
          });
          if (!passSP) errors.push(restriction.message);
          break;
        case "hasHat":
          if (!restriction.blockTypes.includes(block.getRootBlock().type))
            errors.push(restriction.message);
        case "blockExists":
          let passBE = false;
          blocks.forEach((b) => {
            if (restriction.blockTypes.includes(b.type)) passBE = true;
          });
          if (!passBE) errors.push(restriction.message);
      }
    });

    if (errors.length > 0) block.setWarningText(errors.join("\n"));
    else block.setWarningText(null);
  });
}

function hasParentOfType(block, types) {
  let hasParent = false;
  while (block.getParent()) {
    if (types.includes(block.getParent().type)) {
      hasParent = true;
    }
    block = block.getParent();
  }
  return hasParent;
}