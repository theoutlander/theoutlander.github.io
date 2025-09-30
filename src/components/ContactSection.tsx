import React from 'react';
import { css } from '../../styled-system/css/index.mjs';
import { vstack } from '../../styled-system/patterns/index.mjs';
import { FaLinkedin, FaGithub, FaYoutube } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { HiOutlineCalendar } from 'react-icons/hi';
import { HiOutlineDocumentText } from 'react-icons/hi';

interface ContactSectionProps {
  className?: string;
}

export default function ContactSection({ className }: ContactSectionProps) {
  return (
    <div
      className={css(
        {
          bg: 'white',
          borderRadius: '2xl',
          p: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'gray.200',
        },
        className
      )}
    >
      <h2
        className={css({
          fontSize: 'xl',
          fontWeight: 'semibold',
          color: 'gray.800',
          mb: 6,
          fontFamily: 'heading',
        })}
      >
        Contact
      </h2>
      <div className={vstack({ gap: 3, align: 'flex-start' })}>
        <a
          href='mailto:nick@karnik.io'
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bg: 'blue.600',
            color: 'white',
            px: 4,
            py: 2.5,
            borderRadius: 'md',
            textDecoration: 'none',
            fontWeight: 'medium',
            fontSize: 'sm',
            transition: 'all 0.2s',
            _hover: {
              bg: 'blue.700',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            },
          })}
        >
          <MdEmail size={18} />
          Email
        </a>
        <a
          href='https://www.linkedin.com/in/theoutlander'
          target='_blank'
          rel='noopener noreferrer'
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bg: 'transparent',
            color: 'gray.600',
            px: 4,
            py: 2.5,
            borderRadius: 'md',
            textDecoration: 'none',
            fontWeight: 'medium',
            fontSize: 'sm',
            transition: 'all 0.2s',
            _hover: {
              bg: 'gray.50',
              color: 'gray.800',
              transform: 'translateY(-1px)',
            },
          })}
        >
          <FaLinkedin size={18} />
          LinkedIn
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='currentColor'
            className={css({ ml: 'auto', opacity: 0.6 })}
          >
            <path d='M7 14H5v5h2v-5zm8-9h-2v6h2V5zm-3 13h-2v-2h2v2zm2.5-15H7.5C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM18 19.5H7.5v-15h9v15z' />
          </svg>
        </a>
        <a
          href='https://github.com/theoutlander'
          target='_blank'
          rel='noopener noreferrer'
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bg: 'transparent',
            color: 'gray.600',
            px: 4,
            py: 2.5,
            borderRadius: 'md',
            textDecoration: 'none',
            fontWeight: 'medium',
            fontSize: 'sm',
            transition: 'all 0.2s',
            _hover: {
              bg: 'gray.50',
              color: 'gray.800',
              transform: 'translateY(-1px)',
            },
          })}
        >
          <FaGithub size={18} />
          GitHub
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='currentColor'
            className={css({ ml: 'auto', opacity: 0.6 })}
          >
            <path d='M7 14H5v5h2v-5zm8-9h-2v6h2V5zm-3 13h-2v-2h2v2zm2.5-15H7.5C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM18 19.5H7.5v-15h9v15z' />
          </svg>
        </a>
        <a
          href='https://calendly.com/nick-karnik'
          target='_blank'
          rel='noopener noreferrer'
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bg: 'transparent',
            color: 'gray.600',
            px: 4,
            py: 2.5,
            borderRadius: 'md',
            textDecoration: 'none',
            fontWeight: 'medium',
            fontSize: 'sm',
            transition: 'all 0.2s',
            _hover: {
              bg: 'gray.50',
              color: 'gray.800',
              transform: 'translateY(-1px)',
            },
          })}
        >
          <HiOutlineCalendar size={18} />
          Schedule Call
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='currentColor'
            className={css({ ml: 'auto', opacity: 0.6 })}
          >
            <path d='M7 14H5v5h2v-5zm8-9h-2v6h2V5zm-3 13h-2v-2h2v2zm2.5-15H7.5C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM18 19.5H7.5v-15h9v15z' />
          </svg>
        </a>
        <a
          href='https://youtube.com/@nick-karnik'
          target='_blank'
          rel='noopener noreferrer'
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bg: 'transparent',
            color: 'gray.600',
            px: 4,
            py: 2.5,
            borderRadius: 'md',
            textDecoration: 'none',
            fontWeight: 'medium',
            fontSize: 'sm',
            transition: 'all 0.2s',
            _hover: {
              bg: 'gray.50',
              color: 'gray.800',
              transform: 'translateY(-1px)',
            },
          })}
        >
          <FaYoutube size={18} />
          YouTube (reviving soon!)
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='currentColor'
            className={css({ ml: 'auto', opacity: 0.6 })}
          >
            <path d='M7 14H5v5h2v-5zm8-9h-2v6h2V5zm-3 13h-2v-2h2v2zm2.5-15H7.5C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM18 19.5H7.5v-15h9v15z' />
          </svg>
        </a>
        <a
          href='/assets/documents/resume-nick-karnik.pdf'
          target='_blank'
          rel='noopener noreferrer'
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bg: 'transparent',
            color: 'gray.600',
            px: 4,
            py: 2.5,
            borderRadius: 'md',
            textDecoration: 'none',
            fontWeight: 'medium',
            fontSize: 'sm',
            transition: 'all 0.2s',
            _hover: {
              bg: 'gray.50',
              color: 'gray.800',
              transform: 'translateY(-1px)',
            },
          })}
        >
          <HiOutlineDocumentText size={18} />
          Download Resume
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='currentColor'
            className={css({ ml: 'auto', opacity: 0.6 })}
          >
            <path d='M7 14H5v5h2v-5zm8-9h-2v6h2V5zm-3 13h-2v-2h2v2zm2.5-15H7.5C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM18 19.5H7.5v-15h9v15z' />
          </svg>
        </a>
      </div>
    </div>
  );
}
