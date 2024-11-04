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
    "<div class=\"highlight\"><pre><code>#{formatter.format(lexer.lex(code))}</code></pre></div>"
  end
end
