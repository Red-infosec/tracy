onmessage = e => postMessage(router(e));

const router = e => {
  switch (e.data.type) {
    case "search":
      return search(e.data.jobs, e.data.tracerPayloads);
    default:
      return {};
  }
};

// search takes the current set of jobs from the page, filters them
// against the current set of tracer payloads, and sends them as a batch API
// request to the API. Events should contain a list of DOM events.
const search = (domEvents, tracerPayloads) => {
  // A filtered list of DOM events based on if the event has a tracer in it.
  // Each DOM event can have multiple tracer strings.
  let filteredEvents = [];

  // For each DOM write, search for all the tracer strings and collect their location.
  for (let domEvent of domEvents) {
    // Some websites seem to not always write strings to the DOM. In those cases,
    // we don't care about searching.
    if (typeof domEvent.msg !== "string") {
      continue;
    }
    // Each DOM write could have many tracer strings in it. Group these together.
    let tracersPerDomEvent = [];

    // The request is a batched list of DOM events. Iterate through each of them
    // looking for a tracer string.
    for (let tracerPayload of tracerPayloads) {
      // If a tracer was found, add it to the list of tracers found for this event.
      // Continue to the rest of the recorded.
      const tracerLocation = domEvent.msg.toLowerCase().indexOf(tracerPayload);
      if (tracerLocation != -1) {
        // Add this location data to the list of tracers per DOM event.
        tracersPerDomEvent.push(tracerPayload);
      }
    }

    // After collecting all the tracers per DOM event, add this DOM event to the
    // list of filtered DOM events that will be submitted in bulk to the event API.
    if (tracersPerDomEvent.length > 0) {
      filteredEvents = filteredEvents.concat(
        tracersPerDomEvent.map(t => ({
          RawEvent: domEvent.msg,
          EventURL: domEvent.location,
          EventType: domEvent.type,
          TracerPayload: t,
          Extras: JSON.stringify(domEvent.extras)
        }))
      );
    }
  }

  return filteredEvents;
};

const walk = () => {
  return;
};
