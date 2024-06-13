window.onload = function () {
    MIDI.loadPlugin({
      soundfontUrl: "./soundfont/",
      instrument: "acoustic_grand_piano",
      onprogress: function (state, progress) {
        console.log(state, progress);
      },
      onsuccess: function () {
        var delay = 0; // play one note every quarter second
        var note = 50; // the MIDI note
        var velocity = 127; // how hard the note hits
        // play the note
        MIDI.setVolume(0, 127);
        MIDI.noteOn(0, note, velocity, delay);
        MIDI.noteOff(0, note, delay + 0.75);
      },
    });
  };

  function playNote() {
    var delay = 0; // play one note every quarter second
    var note = 50; // the MIDI note
    var velocity = 127; // how hard the note hits
    // play the note
    MIDI.setVolume(0, 127);
    MIDI.noteOn(0, note, velocity, delay);
    MIDI.noteOff(0, note, delay + 0.75);
  }

  // Define a simple sequence
  const sequence = [
    { note: 60, duration: 0.5, delay: 0 },
    { note: 62, duration: 0.5, delay: 0.5 },
    { note: 64, duration: 0.5, delay: 1 },
    { note: 65, duration: 0.5, delay: 1.5 },
    { note: 67, duration: 0.5, delay: 2 },
    { note: 69, duration: 0.5, delay: 2.5 },
    { note: 71, duration: 0.5, delay: 3 },
    { note: 72, duration: 0.5, delay: 3.5 },
  ];

  // Create note elements in the sequencer
  const sequencerElement = document.getElementById("sequencer");
  sequence.forEach((noteObj, index) => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note");
    noteElement.setAttribute("id", `note-0-${index}`);
    noteElement.style.left = `${noteObj.delay * 150}px`;
    noteElement.style.width = `${noteObj.duration * 100}px`;
    noteElement.style.height = `${noteObj.note}px`;
    noteElement.dataset.start = noteObj.delay * 1000; // Convert to milliseconds
    noteElement.dataset.end = (noteObj.delay + noteObj.duration) * 1000; // Convert to milliseconds
    sequencerElement.appendChild(noteElement);

    const select = document.createElement("select");
    select.dataset.index = index;

    for (let i = 21; i <= 108; i++) {
      // MIDI note numbers for 4 octaves
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      if (i === noteObj.note) {
        option.selected = true;
      }
      select.appendChild(option);
    }

    select.addEventListener("change", function () {
      const index = this.dataset.index;
      sequence[index].note = parseInt(this.value);
    });

    noteElement.appendChild(select);
  });

  // Function to move the playhead and play the sequence
  function playSequence() {
    const playhead = document.getElementById("playhead");
    const sequencerWidth = sequencerElement.offsetWidth;
    const totalDuration =
      sequence[sequence.length - 1].delay +
      sequence[sequence.length - 1].duration;

    let startTime = null;

    function movePlayhead(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const position = (elapsed / (totalDuration * 1000)) * sequencerWidth;

      playhead.style.left = `${position}px`;

      // Highlight notes
      document.querySelectorAll(".note").forEach((note) => {
        const start = parseFloat(note.dataset.start);
        const end = parseFloat(note.dataset.end);
        if (elapsed >= start && elapsed <= end) {
          note.classList.add("highlight");
        } else {
          note.classList.remove("highlight");
        }
      });

      // Check if the playhead has reached the end
      if (position < sequencerWidth) {
        requestAnimationFrame(movePlayhead);
      } else {
        playhead.style.left = "0px";
      }
    }

    // Reset the playhead and start the animation
    playhead.style.left = "0px";
    requestAnimationFrame(movePlayhead);

    // Play the sequence
    sequence.forEach((noteObj, index) => {
      MIDI.setVolume(0, 127);
      MIDI.noteOn(0, noteObj.note, 127, noteObj.delay);
      MIDI.noteOff(0, noteObj.note, noteObj.delay + noteObj.duration);
    });
  }