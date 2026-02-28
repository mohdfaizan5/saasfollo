import { useId } from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Component() {
  const id = useId();
  return (
    <RadioGroup className="gap-2" defaultValue="1">
      {/* Radio card #1 */}
      <div className="relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
        <RadioGroupItem
          aria-describedby={`${id}-1-description`}
          className="order-1 after:absolute after:inset-0"
          id={`${id}-1`}
          value="1"
        />
        <div className="flex grow items-center gap-3">
          <svg
            aria-hidden="true"
            className="shrink-0"
            height={32}
            width={32}
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" fill="#121212" r="16" />
            <g clipPath="url(#sb-a)">
              <path
                d="M17.63 25.52c-.506.637-1.533.287-1.545-.526l-.178-11.903h8.003c1.45 0 2.259 1.674 1.357 2.81l-7.637 9.618Z"
                fill="url(#sb-b)"
              />
              <path
                d="M17.63 25.52c-.506.637-1.533.287-1.545-.526l-.178-11.903h8.003c1.45 0 2.259 1.674 1.357 2.81l-7.637 9.618Z"
                fill="url(#sb-c)"
                fillOpacity=".2"
              />
              <path
                d="M14.375 6.367c.506-.638 1.532-.289 1.544.525l.078 11.903H8.094c-1.45 0-2.258-1.674-1.357-2.81l7.638-9.618Z"
                fill="#3ECF8E"
              />
            </g>
            <defs>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="sb-b"
                x1="15.907"
                x2="23.02"
                y1="15.73"
                y2="18.713"
              >
                <stop stopColor="#249361" />
                <stop offset="1" stopColor="#3ECF8E" />
              </linearGradient>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="sb-c"
                x1="12.753"
                x2="15.997"
                y1="11.412"
                y2="17.519"
              >
                <stop />
                <stop offset="1" stopOpacity="0" />
              </linearGradient>
              <clipPath id="sb-a">
                <path d="M6.354 6h19.292v20H6.354z" fill="#fff" />
              </clipPath>
            </defs>
          </svg>
          <div className="grid grow gap-2">
            <Label htmlFor={`${id}-1`}>
              Label{" "}
              <span className="font-normal text-muted-foreground text-xs leading-[inherit]">
                (Sublabel)
              </span>
            </Label>
            <p
              className="text-muted-foreground text-xs"
              id={`${id}-1-description`}
            >
              You can use this card with a label and a description.
            </p>
          </div>
        </div>
      </div>
      {/* Radio card #2 */}
      <div className="relative flex items-center gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50">
        <RadioGroupItem
          aria-describedby={`${id}-2-description`}
          className="order-1 after:absolute after:inset-0"
          id={`${id}-2`}
          value="2"
        />
        <div className="flex grow items-start gap-3">
          <svg
            aria-hidden="true"
            className="shrink-0"
            height={32}
            width={32}
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" fill="#090A15" r="16" />
            <path
              clipRule="evenodd"
              d="M8.004 19.728a.996.996 0 0 1-.008-1.054l7.478-12.199a.996.996 0 0 1 1.753.104l6.832 14.82a.996.996 0 0 1-.618 1.37l-10.627 3.189a.996.996 0 0 1-1.128-.42l-3.682-5.81Zm8.333-9.686a.373.373 0 0 1 .709-.074l4.712 10.904a.374.374 0 0 1-.236.506L14.18 23.57a.373.373 0 0 1-.473-.431l2.63-13.097Z"
              fill="#fff"
              fillRule="evenodd"
            />
          </svg>
          <div className="grid grow gap-2">
            <Label htmlFor={`${id}-2`}>
              Label{" "}
              <span className="font-normal text-muted-foreground text-xs leading-[inherit]">
                (Sublabel)
              </span>
            </Label>
            <p
              className="text-muted-foreground text-xs"
              id={`${id}-2-description`}
            >
              You can use this card with a label and a description.
            </p>
          </div>
        </div>
      </div>
    </RadioGroup>
  );
}
