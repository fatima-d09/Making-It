import { pickNearAction } from "../../engine/input";
import { acceptOffer, annualGross, estWeeklyNet, log, payLabel, scheduleLabel } from "../../game/sim";
import { money, moneyRound } from "../../game/utils";
import { closeModal, quitGame, runSim, useGame } from "../../store/gameStore";
import ApartmentsModal from "./ApartmentsModal";
import Modal from "./Modal";
import MoodModal from "./MoodModal";
import ShopModal from "./ShopModal";
import TravelList from "../game/TravelList";
import WardrobeModal from "./WardrobeModal";

// shows whatever modal is first in the queue
export default function ModalHost() {
  const m = useGame((s) => s.modals[0]);
  const g = useGame((s) => s.game);
  if (!m) return null;

  switch (m.kind) {
    case "message":
      return (
        <Modal key={m.id} title={m.title}>
          <p className="m-0">{m.text}</p>
        </Modal>
      );

    case "offer": {
      const raise = g ? annualGross(m.offer) - annualGross(g.job) : 0;
      return (
        <Modal
          key={m.id}
          title="You got an offer"
          buttons={[
            { label: "Not for me", onClick: () => runSim((d) => log(d, "You turned down the offer.")) },
            { label: "Accept", primary: true, onClick: () => runSim((d) => acceptOffer(d, m.offer)) },
          ]}
        >
          <p className="m-0">
            <b>{m.offer.title}</b> at {m.company}.
          </p>
          <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-1.5 text-[13px]">
            <dt className="text-muted">Pay</dt><dd className="m-0 text-right">{payLabel(m.offer)}</dd>
            <dt className="text-muted">Compared to now</dt>
            <dd className={"m-0 text-right " + (raise >= 0 ? "text-grass" : "font-bold text-bad")}>{(raise >= 0 ? "+" : "−") + moneyRound(Math.abs(raise))}/yr</dd>
            <dt className="text-muted">Take-home</dt><dd className="m-0 text-right">~{money(estWeeklyNet(m.offer))}/wk</dd>
            <dt className="text-muted">Schedule</dt><dd className="m-0 text-right">{scheduleLabel(m.offer)}</dd>
            <dt className="text-muted">Where</dt><dd className="m-0 text-right">{m.offer.place}</dd>
          </dl>
        </Modal>
      );
    }

    case "week": {
      const w = m.week;
      const spent = w.rent + w.food + w.transit + w.fun + w.other;
      const net = w.earned - spent;
      const rows: [string, string, string?][] = [
        ["Earned", money(w.earned), "text-grass"],
        ["Rent", "−" + money(w.rent)],
        ["Food", "−" + money(w.food)],
        ["Getting around", "−" + money(w.transit)],
        ["Going out + clothes", "−" + money(w.fun)],
        ["Other", "−" + money(w.other)],
        ["Net", (net >= 0 ? "+" : "−") + money(Math.abs(net)), net >= 0 ? "text-grass" : "font-bold text-bad"],
      ];
      return (
        <Modal key={m.id} title={"Week " + m.weekNo + " recap"} buttons={[{ label: "Start the week", primary: true }]}>
          <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-1.5 text-[13.5px]">
            {rows.map(([k, v, cls]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className={"m-0 text-right " + (cls ?? "")}>{v}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      );
    }

    case "gameOver":
      return (
        <Modal key={m.id} title={m.title} buttons={[{ label: "Start over", primary: true, onClick: quitGame }]}>
          <p className="m-0">{m.text}</p>
          <p className="m-0 text-muted">You lasted {m.days} days in New York.</p>
        </Modal>
      );

    case "confirmNew":
      return (
        <Modal key={m.id} title="Start over?" dismissable buttons={[{ label: "Keep playing" }, { label: "Start over", primary: true, onClick: quitGame }]}>
          <p className="m-0">This throws away your current life in the city.</p>
        </Modal>
      );

    case "go":
      return (
        <Modal key={m.id} title="Go somewhere" dismissable buttons={[{ label: "Stay here" }]}>
          <TravelList onPick={closeModal} />
        </Modal>
      );

    case "choose":
      return (
        <Modal key={m.id} title="What do you want to do?" dismissable buttons={[{ label: "Never mind" }]}>
          <ChooseList labels={m.labels} />
        </Modal>
      );

    case "shop":
      return <ShopModal key={m.id} cat={m.cat} />;
    case "wardrobe":
      return <WardrobeModal key={m.id} />;
    case "apartments":
      return <ApartmentsModal key={m.id} />;
    case "mood":
      return <MoodModal key={m.id} />;
  }
}

function ChooseList({ labels }: { labels: string[] }) {
  return (
    <div className="grid gap-1.5">
      {labels.map((label) => (
        <button
          key={label}
          className="act"
          onClick={() => {
            closeModal();
            pickNearAction(label);
          }}
        >
          <span className="font-display text-sm font-semibold">{label}</span>
        </button>
      ))}
    </div>
  );
}
