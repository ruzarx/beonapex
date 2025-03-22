import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import React from "react";

const RaceSelector = ({ races, currentRace, onSelect, open, onToggle }) => {
  const today = new Date();

  return (
    <Drawer
      variant="permanent"
      open={open}
      PaperProps={{
        sx: {
          width: open ? 240 : 64,
          transition: "width 0.3s",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <IconButton onClick={onToggle} sx={{ mx: "auto", mt: 1 }}>
        {open ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>

      {/* Scrollable list wrapper */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mt: 1,
          px: 1,
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            width: 0,
          },
          "&:hover::-webkit-scrollbar": {
            width: "6px",
          },
          "&:hover::-webkit-scrollbar-thumb": {
            backgroundColor: "#b0b0b0",
            borderRadius: "3px",
          },
          "&:hover::-webkit-scrollbar-track": {
            background: "transparent",
          },
        }}
      >
        <List disablePadding dense>
          {races.map((race) => {
            const isUpcoming = new Date(race.race_date) > today;

            return (
              <Tooltip
                key={race.race_number}
                title={race.race_name}
                placement="right"
                disableHoverListener={open}
              >
                <ListItemButton
                  selected={race.race_number === currentRace}
                  onClick={() => onSelect(race)}
                  sx={{
                    minHeight: 30,
                    py: 0,
                    my: 0,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  <ListItemText
                    primary={open ? race.race_name : race.short_name}
                    primaryTypographyProps={{
                      fontSize: "0.775rem",
                      fontStyle: isUpcoming ? "italic" : "normal",
                      color: isUpcoming ? "text.secondary" : "text.primary",
                      lineHeight: 1.2,
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default RaceSelector;
