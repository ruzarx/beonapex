import React, { useState } from "react";
import {
  ButtonGroup,
  Button,
  Divider,
  Box,
  Typography
} from "@mui/material";

const GroupSelector = ({ onGroupSelect }) => {
  const [selectedGroup, setSelectedGroup] = useState("I");
  const [useStarGroup, setUseStarGroup] = useState(true);

  const starGroups = ["I", "II", "III", "IV"];
  const openGroups = ["I-II", "III", "IV"];

  const handleGroupClick = (group, isStar) => {
    setSelectedGroup(group);
    setUseStarGroup(isStar);
    onGroupSelect(group, isStar);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <Box>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', textAlign: 'center' }}>
            Star Groups
          </Typography>
          <ButtonGroup size="small">
            {starGroups.map((group) => (
              <Button
                key={group}
                onClick={() => handleGroupClick(group, true)}
                variant={selectedGroup === group && useStarGroup ? "contained" : "outlined"}
                sx={{
                  minWidth: '60px',
                  bgcolor: selectedGroup === group && useStarGroup ? 'primary.main' : 'transparent'
                }}
              >
                {group}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', textAlign: 'center' }}>
            Open Groups
          </Typography>
          <ButtonGroup size="small">
            {openGroups.map((group) => (
              <Button
                key={group}
                onClick={() => handleGroupClick(group, false)}
                variant={selectedGroup === group && !useStarGroup ? "contained" : "outlined"}
                sx={{
                  minWidth: '60px',
                  bgcolor: selectedGroup === group && !useStarGroup ? 'primary.main' : 'transparent'
                }}
              >
                {group}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Box>
    </Box>
  );
};

export default GroupSelector; 