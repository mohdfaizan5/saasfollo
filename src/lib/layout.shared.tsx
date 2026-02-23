import { LuAlbum, LuHeart, LuLayoutTemplate } from "react-icons/lu";
import Image from "next/image";
import type { BaseLayoutProps, LinkItemType } from "fumadocs-ui/layouts/shared";
import Logo from "@/components/logo";
// import { FumadocsIcon } from '@/app/layout.client';
// import Logo from '@/public/logo.png';

export const linkItems: LinkItemType[] = [
    // {
    //   type: "custom",
    //   children: (
    //     <Link
    //       href={"/"}
    //       className=" text-xl font-light  font-bbh flex items-center"
    //     >
    //       {/* <span className="bg-[#007AFF] px-2  rounded-sm">A</span> */}

    //       <Image
    //         src={"/appykitUI temp logo.png"}
    //         height={30}
    //         width={30}
    //         className="rounded-t-sm"
    //         alt=""
    //       />
    //       <span className="-ml-1">ppykitUI</span>
    //     </Link>
    //   ),
    //   on: "all",
    // },

    {
        type: "custom",
        on: "nav",
        children: (
            <NavbarMenu>
                <NavbarMenuTrigger>
                    <Link href="/resources">Resources</Link>
                </NavbarMenuTrigger>
                <NavbarMenuContent>
                    <NavbarMenuLink href="/startupperks" className="md:row-span-2 relative">
                        <div className="absolute bottom-1 right-0">
                            {/* <Image
                                src={Preview}
                                alt="Perview"
                                className="rounded-t-lg object-cover"
                                style={{
                                    maskImage: "linear-gradient(to bottom,white 60%,transparent)",
                                }}
                            /> */}
                            <MoneyWavyIcon size={120} className="opacity-50 rotate-12" weight="duotone" />


                        </div>
                        <p className="font-medium">Startup Perks</p>
                        <p className="text-fd-muted-foreground text-sm">
                            Get exclusive discounts and offers for your startup.
                        </p>
                    </NavbarMenuLink>

                    <NavbarMenuLink
                        href="/resources/copywriting"
                        className="lg:col-start-2"
                    ><PencilCircleIcon size={32} weight="duotone" />


                        {/* <FaFlutter className="bg-fd-primary text-fd-primary-foreground p-1 mb-2 rounded-md" /> */}
                        <p className="font-medium">Copywriting</p>
                        <p className="text-fd-muted-foreground text-sm">
                            Learn the art that makes you sell stuff
                        </p>
                    </NavbarMenuLink>

                    <NavbarMenuLink
                        href="/resources/tools"
                        className="lg:col-start-2"
                    >
                        <FaDartLang className="bg-fd-primary text-fd-primary-foreground p-1 mb-2 rounded-md" />
                        <p className="font-medium">Tools</p>
                        <p className="text-fd-muted-foreground text-sm">
                            Generate interactive playgrounds and docs for your OpenAPI schema.
                        </p>
                    </NavbarMenuLink>

                    {/* <NavbarMenuLink
              href="/docs/ui/markdown"
              className="lg:col-start-3 lg:row-start-1"
            >
              <IconPencil className="bg-fd-primary text-fd-primary-foreground p-1 mb-2 rounded-md" />
              <p className="font-medium">Markdown</p>
              <p className="text-fd-muted-foreground text-sm">
                Learn the writing format/syntax of Fumadocs.
              </p>
            </NavbarMenuLink>

            <NavbarMenuLink
              href="/docs/ui/manual-installation"
              className="lg:col-start-3 lg:row-start-2"
            >
              <IconPlus className="bg-fd-primary text-fd-primary-foreground p-1 mb-2 rounded-md" />
              <p className="font-medium">Manual Installation</p>
              <p className="text-fd-muted-foreground text-sm">
                Setup Fumadocs for your existing Next.js app.
              </p>
            </NavbarMenuLink> */}
                </NavbarMenuContent>
            </NavbarMenu>
        ),
    },

    {
        // icon: <BookIcon />,
        text: "Blog",
        url: "/blog",
        // secondary items will be displayed differently on navbar
        secondary: false,
    },
    {
        // icon: <BookIcon />,
        text: "Start for Free ->",
        url: "/projects",
        // secondary items will be displayed differently on navbar
        secondary: true,
    },
    // {
    //   type: "menu",
    //   text: "Flutter",
    //   items: [
    //     {
    //       text: "Flutter Resources",
    //       description: "Learn to use Fumadocs",
    //       url: "/docs",
    //     },
    //   ],
    // },
];

export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            title: <Logo full link={false} height={30} width={30} />,
        },
    };
}

import { BiBook } from "react-icons/bi";
import Link from "next/link";
import {
    NavbarMenu,
    NavbarMenuContent,
    NavbarMenuLink,
    NavbarMenuTrigger,
} from "fumadocs-ui/layouts/home/navbar";

import { FaDartLang, FaFlutter } from "react-icons/fa6";
import { MoneyWavyIcon, PencilCircleIcon } from "@phosphor-icons/react/dist/ssr";
// export function baseOptions(): BaseLayoutProps {
//   return {
//     nav: {
//       title: (
//         <>
//           <Link
//             href={"/"}
//             className=" text-xl font-light  font-bbh flex items-center"
//           >
//             {/* <span className="bg-[#007AFF] px-2  rounded-sm">A</span> */}

//             <Image
//               src={"/appykitUI temp logo.png"}
//               height={30}
//               width={30}
//               className="rounded-t-sm"
//               alt=""
//             />
//             <span className="-ml-1">ppykitUI</span>
//           </Link>
//           <span className="font-medium in-[.uwu]:hidden">Fumadocs</span>
//         </>
//       ),
//     },
//     // links:
//   };
// }
