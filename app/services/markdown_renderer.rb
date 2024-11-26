require "rouge"
require "rouge/plugins/redcarpet"

class MarkdownRenderer < Redcarpet::Render::HTML
  include Rouge::Plugins::Redcarpet

  def block_code(code, language)
    lexer = Rouge::Lexer.find_fancy(language, code) || Rouge::Lexers::PlainText.new
    formatter = Rouge::Formatters::HTML.new(
      css_class: "highlight",
      line_numbers: false,
      wrap: false
    )
    formatted_code = formatter.format(lexer.lex(code))

    <<-HTML
      <div class="code-block" data-controller="copy-code">
        <div class="code-block__header">
          <button type="button"#{' '}
                  class="code-block__copy-btn btn"#{' '}
                  data-copy-code-target="button"
                  data-action="click->copy-code#copy">
            Copy
          </button>
        </div>
        <div class="highlight">
          <pre><code data-copy-code-target="code">#{formatted_code}</code></pre>
        </div>
      </div>
    HTML
  end

  def image(link, title, alt_text)
    # Check for dimension syntax (=WxH)
    if link =~ /^(.+?)\s*=(\d+|auto)?x(\d+|auto)?$/
      url, width, height = $1, $2, $3

      # Build style attribute
      style = []
      style << "width: #{width == 'auto' ? 'auto' : width + 'px'}" if width
      style << "height: #{height == 'auto' ? 'auto' : height + 'px'}" if height

      if style.any?
        %(<img src="#{url}" alt="#{alt_text}" title="#{title}" style="#{style.join('; ')}">)
      else
        %(<img src="#{url}" alt="#{alt_text}" title="#{title}">)
      end
    else
      %(<img src="#{link}" alt="#{alt_text}" title="#{title}">)
    end
  end
end
