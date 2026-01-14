/**
 * Centralized validation utilities for the flashcard app
 */

export interface ValidationError {
  field: string
  message: string
  code: string
}

export class ValidationResult {
  constructor(
    public isValid: boolean,
    public errors: ValidationError[] = [],
  ) {}

  addError(field: string, message: string, code = "VALIDATION_ERROR"): void {
    this.errors.push({ field, message, code })
    this.isValid = false
  }

  hasError(field: string): boolean {
    return this.errors.some((error) => error.field === field)
  }

  getError(field: string): ValidationError | undefined {
    return this.errors.find((error) => error.field === field)
  }
}

// Deck validation
export function validateDeckName(name: string): ValidationResult {
  const result = new ValidationResult(true)

  if (!name || name.trim().length === 0) {
    result.addError("name", "Deck name is required", "REQUIRED")
  } else if (name.length > 100) {
    result.addError("name", "Deck name must be less than 100 characters", "MAX_LENGTH")
  } else if (name.length < 2) {
    result.addError("name", "Deck name must be at least 2 characters", "MIN_LENGTH")
  }

  return result
}

export function validateDeckDescription(description: string): ValidationResult {
  const result = new ValidationResult(true)

  if (!description || description.trim().length === 0) {
    result.addError("description", "Description is required", "REQUIRED")
  } else if (description.length > 500) {
    result.addError("description", "Description must be less than 500 characters", "MAX_LENGTH")
  } else if (description.length < 5) {
    result.addError("description", "Description must be at least 5 characters", "MIN_LENGTH")
  }

  return result
}

export function validateDeck(name: string, description: string): ValidationResult {
  const result = new ValidationResult(true)

  const nameValidation = validateDeckName(name)
  const descriptionValidation = validateDeckDescription(description)

  if (!nameValidation.isValid) {
    result.errors.push(...nameValidation.errors)
    result.isValid = false
  }

  if (!descriptionValidation.isValid) {
    result.errors.push(...descriptionValidation.errors)
    result.isValid = false
  }

  return result
}

// Flashcard validation
export function validateQuestion(question: string): ValidationResult {
  const result = new ValidationResult(true)

  if (!question || question.trim().length === 0) {
    result.addError("question", "Question is required", "REQUIRED")
  } else if (question.length > 500) {
    result.addError("question", "Question must be less than 500 characters", "MAX_LENGTH")
  } else if (question.length < 3) {
    result.addError("question", "Question must be at least 3 characters", "MIN_LENGTH")
  }

  return result
}

export function validateAnswer(answer: string): ValidationResult {
  const result = new ValidationResult(true)

  if (!answer || answer.trim().length === 0) {
    result.addError("answer", "Answer is required", "REQUIRED")
  } else if (answer.length > 2000) {
    result.addError("answer", "Answer must be less than 2000 characters", "MAX_LENGTH")
  } else if (answer.length < 3) {
    result.addError("answer", "Answer must be at least 3 characters", "MIN_LENGTH")
  }

  return result
}

export function validateFlashcard(question: string, answer: string): ValidationResult {
  const result = new ValidationResult(true)

  const questionValidation = validateQuestion(question)
  const answerValidation = validateAnswer(answer)

  if (!questionValidation.isValid) {
    result.errors.push(...questionValidation.errors)
    result.isValid = false
  }

  if (!answerValidation.isValid) {
    result.errors.push(...answerValidation.errors)
    result.isValid = false
  }

  return result
}

// Text to flashcard conversion validation
export function validateTextInput(text: string): ValidationResult {
  const result = new ValidationResult(true)

  if (!text || text.trim().length === 0) {
    result.addError("text", "Please provide some text to convert", "REQUIRED")
  } else if (text.length < 20) {
    result.addError("text", "Text must be at least 20 characters for quality flashcard generation", "MIN_LENGTH")
  } else if (text.length > 10000) {
    result.addError("text", "Text must be less than 10,000 characters", "MAX_LENGTH")
  }

  return result
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  const result = new ValidationResult(true)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email || email.trim().length === 0) {
    result.addError("email", "Email is required", "REQUIRED")
  } else if (!emailRegex.test(email)) {
    result.addError("email", "Please enter a valid email address", "INVALID_FORMAT")
  }

  return result
}

// Sanitization utilities
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .slice(0, 2000) // Limit length
}

export function sanitizeDeckName(name: string): string {
  return sanitizeText(name).slice(0, 100)
}

export function sanitizeQuestion(question: string): string {
  return sanitizeText(question).slice(0, 500)
}

export function sanitizeAnswer(answer: string): string {
  return sanitizeText(answer).slice(0, 2000)
}
