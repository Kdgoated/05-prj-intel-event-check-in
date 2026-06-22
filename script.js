const attendanceGoal = 50;
const storageKey = "intel-summit-checkin-state";

const teamLabels = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

const teamIcons = {
  water: "🌊",
  zero: "🌿",
  power: "⚡",
};

let state = {
  total: 0,
  teams: {
    water: 0,
    zero: 0,
    power: 0,
  },
  attendees: [],
};

const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const waterCount = document.getElementById("waterCount");
const zeroCount = document.getElementById("zeroCount");
const powerCount = document.getElementById("powerCount");
const attendeeList = document.getElementById("attendeeList");

function loadState() {
  const savedState = localStorage.getItem(storageKey);

  if (!savedState) {
    return;
  }

  try {
    const parsedState = JSON.parse(savedState);

    if (typeof parsedState.total === "number") {
      state.total = parsedState.total;
    }

    if (parsedState.teams) {
      state.teams.water = parsedState.teams.water || 0;
      state.teams.zero = parsedState.teams.zero || 0;
      state.teams.power = parsedState.teams.power || 0;
    }

    if (Array.isArray(parsedState.attendees)) {
      state.attendees = parsedState.attendees;
    }
  } catch (error) {
    localStorage.removeItem(storageKey);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getWinningTeam() {
  const teamEntries = [
    { key: "water", count: state.teams.water },
    { key: "zero", count: state.teams.zero },
    { key: "power", count: state.teams.power },
  ];

  let winningTeam = teamEntries[0];
  let isTie = false;

  for (let index = 1; index < teamEntries.length; index += 1) {
    const currentTeam = teamEntries[index];

    if (currentTeam.count > winningTeam.count) {
      winningTeam = currentTeam;
      isTie = false;
    } else if (currentTeam.count === winningTeam.count) {
      isTie = true;
    }
  }

  if (isTie) {
    return {
      tie: true,
      label: "All teams",
      count: winningTeam.count,
    };
  }

  return {
    tie: false,
    label: teamLabels[winningTeam.key],
    count: winningTeam.count,
  };
}

function renderAttendees() {
  attendeeList.innerHTML = "";

  if (state.attendees.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "attendee-empty";
    emptyItem.textContent = "No attendees checked in yet.";
    attendeeList.appendChild(emptyItem);
    return;
  }

  for (let index = 0; index < state.attendees.length; index += 1) {
    const attendee = state.attendees[index];
    const item = document.createElement("li");
    item.className = `attendee-item ${attendee.team}`;

    const label = document.createElement("span");
    label.className = "attendee-name";
    label.textContent = attendee.name;

    const team = document.createElement("span");
    team.className = "attendee-team";
    team.textContent = `${teamIcons[attendee.team]} ${teamLabels[attendee.team]}`;

    item.appendChild(label);
    item.appendChild(team);
    attendeeList.appendChild(item);
  }
}

function updateUI() {
  attendeeCount.textContent = state.total;
  waterCount.textContent = state.teams.water;
  zeroCount.textContent = state.teams.zero;
  powerCount.textContent = state.teams.power;

  const progress = Math.min((state.total / attendanceGoal) * 100, 100);
  progressBar.style.width = `${progress}%`;

  if (state.total === 0) {
    greeting.style.display = "none";
  } else if (state.total >= attendanceGoal) {
    const winningTeam = getWinningTeam();

    if (winningTeam.tie) {
      greeting.textContent = `Celebration time! It is a tie between all teams at ${winningTeam.count} check-ins each.`;
    } else {
      greeting.textContent = `Celebration time! ${winningTeam.label} is leading the summit with ${winningTeam.count} check-ins.`;
    }

    greeting.className = "success-message";
    greeting.style.display = "block";
  } else {
    const latestAttendee = state.attendees[state.attendees.length - 1];

    if (latestAttendee) {
      greeting.textContent = `Welcome, ${latestAttendee.name}! You are checked in with ${teamLabels[latestAttendee.team]}.`;
    } else {
      greeting.textContent = `Welcome to the Sustainability Summit!`;
    }

    greeting.className = "";
    greeting.style.display = "block";
  }

  renderAttendees();
}

function handleCheckIn(event) {
  event.preventDefault();

  const attendeeName = nameInput.value.trim();
  const selectedTeam = teamSelect.value;

  if (attendeeName === "" || selectedTeam === "") {
    return;
  }

  state.total += 1;
  state.teams[selectedTeam] += 1;
  state.attendees.push({
    name: attendeeName,
    team: selectedTeam,
  });

  saveState();
  updateUI();
  form.reset();
  nameInput.focus();
}

loadState();
updateUI();

form.addEventListener("submit", handleCheckIn);
